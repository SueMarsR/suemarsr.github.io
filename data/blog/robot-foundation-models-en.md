# The Next Step for Robot Foundation Models: Adaptation, Reasoning, and Real-World Evaluation

Over the last few years, robot learning has moved toward generalist policies: models that combine vision, language, and action so that a robot can follow natural-language instructions across tasks, scenes, and sometimes embodiments. OpenVLA, Octo, π0/π0.5, and DROID-style policies all belong to this broader trend.

But from first principles, deploying robot foundation models is not just a question of making the model larger. A useful robot system needs to answer three more basic questions:

1. When a pretrained policy is not good enough on a new task, how do we improve it cheaply?
2. How can high-level semantic reasoning from VLMs actually affect low-level control?
3. How do we know that a policy is really better in the physical world?

The papers in the overview slide form a coherent research arc around these three questions.

## 1. Improving Existing Policies with RL

The first set of works asks how to adapt a strong pretrained diffusion, flow, or VLA policy with reinforcement learning without destroying the useful behavior it already knows.

[DSRL: Steering Your Diffusion Policy with Latent Space Reinforcement Learning](https://arxiv.org/abs/2506.15799) proposes a simple but powerful idea: keep the diffusion or flow policy frozen, and run RL in its latent-noise space. Instead of sampling the initial denoising noise from a standard Gaussian, DSRL trains a small latent policy to choose noise values that steer the frozen base policy toward higher-reward behavior.

This matters because exploration remains close to the behavior manifold of the pretrained policy. In robotics, that is a major advantage. Standard RL in a high-dimensional continuous action space can produce unsafe or meaningless actions, while latent-noise steering searches through behaviors that the base policy can already express. DSRL is evaluated on Robomimic, Gym, OGBench, real Franka and WidowX tasks, BridgeV2, and π0 on LIBERO, Aloha, and DROID setups. In the π0 experiments, DSRL improves a 3.3B-parameter VLA without fine-tuning the model itself, using only a lightweight actor-critic wrapper.

[Q-learning with Adjoint Matching](https://arxiv.org/abs/2601.14234) tackles a different bottleneck: how to optimize an expressive flow or diffusion policy with respect to a learned Q-function. Directly backpropagating through a multi-step denoising or flow process can be numerically unstable. Ignoring the critic's action gradient wastes useful first-order information. QAM uses adjoint matching to transform the critic action gradient into a step-wise training objective for the policy, avoiding unstable backpropagation through time while retaining the expressiveness of the generative policy. Across 50 OGBench tasks in offline and offline-to-online settings, QAM shows that the key issue is not whether generative policies can be used for RL, but whether the policy extraction interface is correct.

[Decoupled Q-Chunking](https://arxiv.org/abs/2512.10926) focuses on temporal structure. Modern robot policies often predict action chunks. Long chunks help with long-horizon value backup, but long open-loop actor chunks reduce reactivity. DQC decouples these two roles: the critic reasons over longer action chunks, while the actor outputs shorter chunks. This preserves fast multi-step value propagation without forcing the policy to act open-loop for too long.

Together, these works suggest that robot policy post-training should not simply copy RLHF recipes from language models. Robot actions are continuous, high-frequency, and physically constrained. The better approach is to exploit the structure of the pretrained policy and place RL in a space where it is easier and safer to optimize: latent noise, flow objectives, or chunked value functions.

## 2. Turning VLM Reasoning into Control

The second group of works studies the interface between high-level reasoning and low-level action.

[Steerable Vision-Language-Action Policies](https://arxiv.org/abs/2602.13193) starts from a practical observation: many hierarchical robot systems ask a VLM to output a high-level subtask, which is then executed by a low-level VLA. But natural-language task instructions are a narrow control interface. A VLM may understand that the robot should move around an obstacle, lift before translating, or point toward a visually ambiguous object. If the low-level policy only accepts instructions like "pick up the object," that reasoning cannot reliably shape the motion.

The paper trains Steerable Policies: VLAs that accept commands at multiple levels of abstraction, including task instructions, subtasks, atomic motions, traces, and grounded points. Experiments are conducted on real Bridge/WidowX manipulation tasks, using OpenVLA and π0.5 as base policies. The high-level controller can be a human oracle, a fine-tuned embodied reasoner, or an off-the-shelf VLM such as Gemini. The key observation is that different command styles are useful for different failures. Points and traces help with semantic out-of-distribution objects. Atomic motion commands help with spatial relations. Task and subtask language remains useful for in-distribution behavior. The broader lesson is that VLM reasoning is bottlenecked by low-level policy controllability.

[SteerVLA](https://arxiv.org/abs/2602.08440) transfers the same idea to autonomous driving. A high-level VLM produces fine-grained language or meta-action guidance for long-tail driving scenes, while a low-level VLA predicts future waypoints and control. Since driving datasets often lack fine-grained language supervision, the authors use Gemini 2.5 Flash-Lite to generate control-relevant semantic labels for existing driving data. On CARLA Bench2Drive and the constructed Bench2Drive-LongTail subset, SteerVLA improves the overall driving score by 4.77 points over the prior state of the art, and by 8.04 points on long-tail scenarios.

The common message is clear: long-tail robot and driving problems require semantic and commonsense reasoning, but reasoning only helps when it is expressed through an interface that the low-level policy can execute.

The slide also lists *Adapting Generalist Robot Policies with Semantic Reinforcement Learning*. I could not find a public paper text for this work. Based on the title, it likely sits at the intersection of DSRL-style adaptation and semantic steering: using semantic signals or VLM-based rewards to reduce the cost of reward engineering. That direction is natural, but it comes with risks such as reward hacking, VLM misclassification, and mismatch between semantic judgment and physical success.

## 3. Scaling Real-World Evaluation

The third group of works is not about making a stronger policy directly. It asks a more basic question: how do we know whether a robot policy is actually stronger?

[AutoEval](https://arxiv.org/abs/2503.24278) automates real-world robot evaluation. The system includes a job queue, policy rollout, a learned success classifier, a learned reset policy, and safety checks. A user submits a policy, and the robot runs trials, scores success, resets the scene, and returns a report. The Bridge-AutoEval experiments use WidowX setups with drawer opening and closing, eggplant pick-and-place, and cloth folding tasks. Evaluated policies include OpenVLA, Octo, Open-π0, MiniVLA, SuSIE, and SuSIE-LL. AutoEval achieves a Pearson correlation of 0.942 with human oracle evaluations and an MMRV of 0.015. In a 24-hour run, it requires only three human interventions and reduces human supervision time by more than 99%.

[RoboArena](https://arxiv.org/abs/2506.18123) takes evaluation in a distributed direction. Instead of forcing every institution to reproduce the same tasks and scenes, it asks evaluators to run double-blind pairwise A/B comparisons on their own DROID robot setups. These pairwise preferences are aggregated into a global ranking using a task-aware Bradley-Terry-style model. The initial evaluation spans seven institutions, seven generalist DROID policies, 612 pairwise comparisons, and 4,284 total rollouts. Compared with centralized fixed-task evaluation, RoboArena better captures the diversity that generalist policies are supposed to handle.

Together, AutoEval and RoboArena show that robotics needs evaluation infrastructure, not just evaluation benchmarks. As policies become more general, small hand-run success-rate tables become less informative. The field needs real-world, diverse, high-throughput, and comparable evaluation loops.

## 4. These Works Form a Self-Improvement Loop

The papers fit together into a larger system:

- AutoEval and RoboArena expose real failure modes.
- Humans, VLMs, or semantic modules translate failures into steering signals, rewards, or diagnostics.
- DSRL, QAM, and DQC use sample-efficient RL to adapt an existing foundation policy.
- The adapted policy goes back into real-world evaluation.

This loop is more important than simply training a larger VLA. In real deployment, robot policies often do not fail because they know nothing. They fail because they are slightly misaligned with a new scene, object, initial condition, latency profile, or reward definition. For that regime, post-training, steerable interfaces, and scalable real-world evaluation are more valuable than model size alone.

## 5. Open Gaps

Reward design remains a bottleneck. DSRL and QAM show that generative policies can be improved efficiently with RL, but real-world rewards are still expensive to define. Semantic rewards may help, but they need protection against reward hacking and semantic-physical mismatch.

Steering is limited by the base policy's support. If a pretrained policy has never learned tool use, cloth dynamics, or hard contact-rich behavior, latent or language steering cannot invent those capabilities from nothing.

Inference latency is a deployment constraint. Large VLAs are slow, and action chunking can reduce reactivity. The listed work *Learning to Act While Waiting* likely addresses this missing piece: a robot cannot simply stop controlling while waiting for the next model inference.

Evaluation still needs more resolution. AutoEval currently emphasizes binary success, while RoboArena is broader but less controlled. Future evaluation should report success, progress, safety, latency, intervention frequency, and failure taxonomies together.

## Closing

The main signal from this line of work is that the next step for robot foundation models is not only larger models or more data. It is a closed-loop system in which pretrained policies provide behavioral priors, VLMs provide semantic reasoning, RL provides task-level improvement, and real-world evaluation infrastructure provides feedback. The most useful robot systems are likely to emerge where these lines meet.
