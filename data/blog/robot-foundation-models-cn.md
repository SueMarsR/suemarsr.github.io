# Robot Foundation Models 的下一步：从更大的模型，到可适配、可推理、可评测的闭环

过去几年，机器人领域的一个主旋律是训练更大的 generalist policy：把视觉、语言和动作统一到一个模型里，让机器人能够在不同场景、不同任务，甚至不同 embodiment 上执行自然语言指令。OpenVLA、Octo、π0/π0.5、DROID 系列模型都属于这条路线。

但如果从第一性原理看，机器人 foundation model 真正落地并不只取决于“模型是否够大”。机器人系统至少要解决三个更底层的问题：

1. 预训练 policy 在新任务上不够好时，如何低成本改好？
2. 高层 VLM 的语义推理，如何真正转化为低层可执行动作？
3. 改进是否真的有效，如何在真实世界中大规模、可比较地评测？

截图里的这组工作，正好围绕这三个问题形成了一条清晰的研究主线。

## 1. 用 RL 改好已有 policy，而不是从零训练

第一组工作关注的是：给定一个已经很强的 diffusion/flow/VLA policy，如何用强化学习进一步适配，而不破坏已有能力。

[DSRL: Steering Your Diffusion Policy with Latent Space Reinforcement Learning](https://arxiv.org/abs/2506.15799) 的核心想法非常直接：不要直接微调 diffusion policy 的权重，也不要在动作空间里做 residual control，而是在 diffusion/flow policy 的 latent noise 空间里做 RL。也就是说，base policy 保持冻结，RL agent 只学习该给 diffusion denoiser 什么初始噪声，从而把原本随机采样的动作分布“steer”到更高奖励的模式。

这个设计的关键好处是，RL 搜索仍然被限制在 base policy 学到的行为流形附近。对真实机器人来说，这很重要：传统 RL 在连续高维动作空间中探索很容易产生无意义甚至危险的动作，而 latent noise steering 更像是在已有技能库中选择和偏移。实验上，DSRL 在 Robomimic、OGBench、真实 Franka/WidowX，以及 π0 的 LIBERO、Aloha 和 DROID 设定上都展示了样本效率优势。尤其在 π0 实验中，DSRL 不需要微调 3.3B 参数模型，只用一个轻量 actor/critic 就能显著提升真实任务成功率。

[Q-learning with Adjoint Matching](https://arxiv.org/abs/2601.14234) 处理的是另一个瓶颈：如果 policy 是 expressive 的 flow/diffusion model，如何稳定地用 critic 的梯度去优化它？直接对多步 denoising/flow 过程反传容易数值不稳定；只用 value 而不用 action gradient 又浪费了 critic 的一阶信息。QAM 用 adjoint matching 把 critic 的 action gradient 转换成逐步训练目标，避免不稳定的 backpropagation through time，同时保留生成式 policy 的表达力。它在 OGBench 50 个任务上做 offline 和 offline-to-online RL，结论是：问题不是“生成式 policy 能不能做 RL”，而是要有正确的 policy extraction/optimization 接口。

[Decoupled Q-Chunking](https://arxiv.org/abs/2512.10926) 则从时间结构入手。现代机器人 policy 常用 action chunking，一次预测一串动作。长 chunk 有利于长程价值传播，但如果 actor 也开环执行长 chunk，反应性会下降。DQC 的做法是让 critic 看长 chunk、actor 输出短 chunk：critic 负责更快地做 multi-step backup，actor 保持闭环反应能力。这个解耦特别适合长程、稀疏奖励的 goal-conditioned offline RL。

这三篇放在一起看，可以得到一个共同观察：robot foundation model 的 post-training 不应该简单照搬语言模型 RLHF。机器人动作是连续、高频、受物理约束的；更有效的办法是利用已有 policy 的结构，把 RL 放在更合适的空间里，例如 latent noise、flow objective、chunked critic。

## 2. 让 VLM 推理真正控制低层动作

第二组工作关注 VLM reasoning 和 robot control 之间的接口问题。

[Steerable Vision-Language-Action Policies](https://arxiv.org/abs/2602.13193) 的出发点是：很多层级式机器人系统让高层 VLM 输出自然语言 subtask，再交给低层 VLA 执行。但自然语言 task instruction 是一个很窄的接口。VLM 可能知道“应该从右边绕开障碍物”或“应该先往上提再移动”，但如果低层 policy 只接受“pick up the object”这类指令，高层推理无法有效影响动作细节。

因此，这篇工作训练了 Steerable Policies：低层 VLA 不只接受 task-level language，还接受 subtask、atomic motion、轨迹、点坐标等多层次 steering commands。实验在 Bridge/WidowX 真实机器人上进行，base model 包括 OpenVLA 和 π0.5，高层可以是人类 oracle、fine-tuned embodied reasoner，也可以是 Gemini 这类 off-the-shelf VLM。结果显示，不同 command style 各有优势：point/trace 对语义 OOD 物体尤其有用，atomic motion 对空间关系更有效，task/subtask 对 in-distribution 行为更稳。核心结论是：VLM reasoning 的价值受限于 low-level policy 的可控性；要释放高层语义能力，必须把控制接口做得更细。

[SteerVLA](https://arxiv.org/abs/2602.08440) 把相同思想迁移到自动驾驶。高层 VLM 根据长尾驾驶场景生成细粒度语言/meta-action，低层 VLA 生成 future waypoints/control。由于驾驶数据通常缺少细粒度语言标注，作者用 Gemini 2.5 Flash-Lite 为已有 driving data 自动生成与控制相关的语义标签。实验在 CARLA Bench2Drive 和作者构造的 Bench2Drive-LongTail 上进行，SteerVLA 在整体 driving score 上比 SOTA 高 4.77，在 long-tail subset 上高 8.04。这个结果强化了同一个 observation：长尾场景需要常识和语义推理，但推理必须通过可执行、细粒度的接口落到控制上。

截图中还有一篇 *Adapting Generalist Robot Policies with Semantic Reinforcement Learning*，我没有找到公开论文文本。但从题名看，它很可能处在 DSRL 和 Steerable Policies 的交界处：用语义信号或 VLM-based reward 来降低真实机器人 reward engineering 成本。这个方向很自然，但风险也明显：语义 reward 容易 reward hacking，VLM 的语言判断也可能和真实物理成功错配。

## 3. 真实世界评测必须规模化

第三组工作不直接提出更强 policy，而是处理一个更基础的问题：如何知道 policy 真的更强？

[AutoEval](https://arxiv.org/abs/2503.24278) 试图把真实机器人评测自动化。系统包含任务队列、policy rollout、success classifier、reset policy 和安全检测。用户提交 policy 后，机器人自动执行、判断成功、reset 场景并生成报告。实验在 Bridge-AutoEval 的 WidowX setup 上进行，包括 drawer open/close、eggplant pick-and-place 和 cloth folding 等任务。被测 policy 包括 OpenVLA、Octo、Open-π0、MiniVLA、SuSIE 等。结果显示，AutoEval 与人工 oracle 评测的 Pearson correlation 达到 0.942，MMRV 为 0.015；24 小时运行只需要 3 次人工干预，人工时间降低超过 99%。

[RoboArena](https://arxiv.org/abs/2506.18123) 则走向分布式评测。它不要求所有机构复现完全相同的任务和场景，而是让多个 evaluator 在自己的 DROID 机器人上做双盲 A/B pairwise comparison，再用 task-aware Bradley-Terry 类模型聚合出全局 ranking。实验覆盖 7 个机构、7 个 DROID generalist policies、612 个 pairwise comparisons 和 4284 个 total rollouts。相比传统集中式固定任务评测，RoboArena 更能覆盖 generalist policy 真正面对的任务分布。

这两篇工作共同说明：机器人领域不能只依赖小规模、人工、局部的 success rate。随着 policy 越来越 general，评测也必须从“固定 benchmark”扩展到“真实世界、多样任务、高吞吐、可比较”的基础设施。

## 4. 这些工作拼起来，是一个机器人自改进闭环

把这些论文放在一起，它们不是互相孤立的技巧，而是在拼一个闭环：

- AutoEval/RoboArena 找到真实失败模式；
- VLM/人类/语义模块把失败解释成可操作的 steering signal 或 reward；
- DSRL/QAM/DQC 用低样本 RL 在已有 foundation policy 上做 adaptation；
- 改进后的 policy 再回到真实评测系统中验证。

这个闭环比“训练一个更大的 VLA”更接近机器人系统的真实需求。因为机器人部署的难点往往不是完全不会做，而是在新场景、新物体、新初始状态、新延迟条件下差一点失败。对这类问题，低成本 post-training、语义可控接口和真实世界评测基础设施，比单纯扩大模型参数更关键。

## 5. 仍然存在的关键缺口

第一，reward 仍然是瓶颈。DSRL 和 QAM 证明了生成式 policy 可以被 RL 高效改进，但真实任务的奖励定义仍然昂贵。语义 reward 是方向，但必须处理 reward hacking、VLM 错判和物理成功定义不一致。

第二，steering 受 base policy 支持集限制。如果预训练 policy 从未学过工具使用、复杂布料操作或强接触动力学，latent steering 或 language steering 很难凭空创造新能力。

第三，推理延迟是硬约束。大 VLA 往往慢，action chunking 又带来反应性问题。截图中的 *Learning to Act While Waiting* 很可能正是补这个缺口：机器人不能在等待模型推理时停止控制。

第四，评测还需要更细粒度。AutoEval 当前主要是 binary success，RoboArena 更开放但难以控制变量。未来评测应同时报告 success、progress、safety、latency、intervention frequency 和 failure taxonomy。

## 结语

这组工作的共同信号是：robot foundation models 的下一步，不只是更大的模型和更多数据，而是可适配、可推理、可评测的系统闭环。Foundation policy 提供行为先验，VLM 提供语义和常识，RL 提供任务级改进，AutoEval/RoboArena 提供真实世界反馈。真正有价值的机器人系统，很可能会从这几条线的交汇处出现。
