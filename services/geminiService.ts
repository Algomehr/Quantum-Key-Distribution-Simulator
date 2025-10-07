import { GoogleGenAI } from "@google/genai";
import type { Protocol, SimulationParams, SimulationResult, LLMAnalysis, EducationalContent } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getBB84Prompt = (params: SimulationParams, result: SimulationResult) => `
  You are a quantum communication expert providing analysis for a Quantum Key Distribution (QKD) simulator in Persian.
  Analyze the following BB84 protocol simulation results.

  **Protocol:** BB84

  **Simulation Parameters:**
  - تعداد کل کیوبیت‌های ارسالی: ${params.qubitCount}
  - درصد استفاده از مبنای Rectilinear (+): ${params.rectilinearBasisPercent}%
  - درصد استراق سمع توسط Eve: ${params.eavesdropPercent}%
  - مدل نویز کانال: ${params.noiseModel === 'Depolarizing' ? 'کانال دپلاریزه' : 'خطای ساده (Bit-Flip)'}
  - ${params.noiseModel === 'Depolarizing' ? 'احتمال دپلاریزه شدن' : 'نرخ خطای ذاتی کانال (QBER)'}: ${params.qberPercent}%

  **Simulation Results:**
  - طول کلید غربال شده (Sifted Key): ${result.siftedKeyLength}
  - نرخ خطای کوانتومی اندازه‌گیری شده: ${(result.measuredQBER * 100).toFixed(2)}%
  - طول کلید نهایی امن (تخمین زده شده): ${result.finalKeyLength}

  **Your Tasks (Respond in Persian):**

  1.  **تحلیل متنی (Textual Analysis):**
      - Provide a step-by-step explanation of what happened in this BB84 simulation. Use Markdown for formatting.
      - Explain why the sifted key length is approximately 50% of the initial qubit count.
      - Analyze the "Measured QBER". Explain how Eve's eavesdropping and the channel noise model contributed to the error rate.
      - Based on the selected noise model (${params.noiseModel}), explain its physical meaning. If it's "Depolarizing", contrast it with the simpler "SimpleQBER" (Bit-Flip) model and discuss why it might be a more realistic simulation of environmental decoherence.
      - If the measured QBER is high (> 11-15%), explain that Alice and Bob would detect Eve and abort.
      - Discuss the security of the final key.
      - Enclose any mathematical formulas in LaTeX syntax ($...$ or $$...$$).

  2.  **اثبات ریاضیاتی شبیه‌سازی شده (Simulated Mathematical Proof):**
      - Provide a simplified, step-by-step mathematical walkthrough using one example qubit.
      - **You MUST use LaTeX for all mathematical notations.** Use notation like |0\\rangle, |+\\rangle.
      - Example: Alice sends $|0\\rangle$. Eve intercepts and measures in the 'x' basis, collapsing the state to a superposition: $$|0\\rangle = \\frac{1}{\\sqrt{2}}(|+\\rangle + |-\\rangle)$$. Show how this introduces errors.

  **Format your response as a single JSON object with two keys: "textual" and "mathematical". Do not include any text outside the JSON object.**
`;

const getE91Prompt = (params: SimulationParams, result: SimulationResult) => `
  You are a quantum communication expert providing analysis for a Quantum Key Distribution (QKD) simulator in Persian.
  Analyze the following E91 protocol simulation results.

  **Protocol:** E91 (Entanglement-based)

  **Simulation Parameters:**
  - تعداد جفت‌های درهم‌تنیده: ${params.qubitCount}
  - درصد انتخاب مبنای اندازه‌گیری Rectilinear (+): ${params.rectilinearBasisPercent}%
  - درصد استراق سمع توسط Eve: ${params.eavesdropPercent}%
  - مدل نویز کانال: ${params.noiseModel === 'Depolarizing' ? 'کانال دپلاریزه' : 'خطای ساده (Bit-Flip)'}
  - ${params.noiseModel === 'Depolarizing' ? 'احتمال دپلاریزه شدن' : 'نرخ خطای ذاتی کانال (QBER)'}: ${params.qberPercent}%

  **Simulation Results:**
  - طول کلید غربال شده (Sifted Key): ${result.siftedKeyLength}
  - نرخ خطای کوانتومی اندازه‌گیری شده: ${(result.measuredQBER * 100).toFixed(2)}%
  - طول کلید نهایی امن (تخمین زده شده): ${result.finalKeyLength}

  **Your Tasks (Respond in Persian):**

  1.  **تحلیل متنی (Textual Analysis):**
      - Provide a step-by-step explanation of the E91 protocol based on this simulation. Use Markdown for formatting.
      - Start by explaining the core concept of **quantum entanglement** and Bell states.
      - Analyze the "Measured QBER". Explain that in E91, **any eavesdropping by Eve breaks the entanglement**, and how channel noise also destroys the perfect correlations.
      - Based on the selected noise model (${params.noiseModel}), explain its physical meaning. If it's "Depolarizing", contrast it with the simpler "SimpleQBER" (Bit-Flip) model and discuss why it's a more realistic simulation of environmental decoherence on one of the entangled particles.
      - Discuss the security of the final key, linking it conceptually to Bell's theorem.
      - Use LaTeX syntax for formulas.

  2.  **اثبات ریاضیاتی شبیه‌سازی شده (Simulated Mathematical Proof):**
      - **You MUST use LaTeX for all mathematical notations.**
      - Start with a Bell state, for example, the singlet state: $$|\\Psi^-\\rangle = \\frac{1}{\\sqrt{2}}(|01\\rangle - |10\\rangle)$$.
      - Show that if Alice and Bob both measure in the same basis, their results are always anti-correlated.
      - Now, describe Eve's attack: She intercepts a particle and measures it. Explain that this action **collapses the superposition** for the entire entangled system, which they detect.

  **Format your response as a single JSON object with two keys: "textual" and "mathematical". Do not include any text outside the JSON object.**
`;

const getEducationalPrompt = (protocol: Protocol) => `
  You are a friendly and clear science communicator tasked with explaining Quantum Key Distribution to a complete beginner in Persian.
  The user knows nothing about quantum physics. Use simple language and analogies.

  **Protocol to Explain:** ${protocol}

  **Your Task:**
  Create a step-by-step educational guide. The output MUST be a single JSON object with three keys: "prerequisites", "protocolSteps", and "securityAnalysis".

  1.  **"prerequisites" (پیش‌نیازهای کوانتومی):**
      - Explain what a **Qubit** is. Compare it to a classical bit. Use an analogy like a spinning coin.
      - Explain **Superposition**. Describe it as the qubit being in multiple states at once before measurement.
      - Explain **Measurement**. Describe how observing a qubit forces it into a definite state (0 or 1).
      - ${protocol === 'E91' ? `- Explain **Entanglement**. Use the "magic twins" or "connected dice" analogy. Explain that measuring one instantly affects the other, no matter the distance.` : ''}
      - Use Markdown for formatting.

  2.  **"protocolSteps" (مراحل پروتکل ${protocol}):**
      - Provide a simple, narrative, step-by-step walkthrough of the protocol.
      - **Step 1:** Describe what Alice (the sender) does.
      - **Step 2:** Describe what Bob (the receiver) does.
      - **Step 3:** Describe their public discussion (comparing bases) to sift the key.
      - **Step 4:** Explain how Eve (the eavesdropper) trying to listen in gets detected.
      - Use a simple, non-technical story format.

  3.  **"securityAnalysis" (تحلیل امنیتی به زبان ساده):**
      - Explain in one or two paragraphs *why* the protocol is secure, based on the fundamental principles of quantum mechanics.
      - For BB84, focus on the "Observer Effect" (measuring disturbs the system).
      - For E91, focus on "Breaking Entanglement" (eavesdropping destroys the perfect correlation).
      - Reassure the user that the security is backed by the laws of physics.

  **Format your response as a single JSON object with the specified keys. Do not include any text outside the JSON object.**
`;


export const analyzeSimulation = async (
  protocol: Protocol,
  params: SimulationParams,
  result: SimulationResult
): Promise<Pick<LLMAnalysis, 'textual' | 'mathematical'>> => {

  const prompt = protocol === 'BB84' 
    ? getBB84Prompt(params, result)
    : getE91Prompt(params, result);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const jsonText = response.text.trim();
    const analysis: Pick<LLMAnalysis, 'textual' | 'mathematical'> = JSON.parse(jsonText);
    return analysis;

  } catch (error) {
    console.error("Error calling Gemini API for simulation analysis:", error);
    return {
      textual: "خطا در برقراری ارتباط با سرویس تحلیلگر. لطفا دوباره تلاش کنید.",
      mathematical: "تحلیل ریاضیاتی به دلیل خطا در دسترس نیست.",
    };
  }
};

export const getEducationalContent = async (protocol: Protocol): Promise<EducationalContent | null> => {
  const prompt = getEducationalPrompt(protocol);
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });
    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Error calling Gemini API for educational content:", error);
    return {
      prerequisites: "## خطا\n\nمتاسفانه در دریافت محتوای آموزشی خطایی رخ داد.",
      protocolSteps: "لطفا اتصال خود را بررسی کرده و دوباره تلاش کنید.",
      securityAnalysis: ""
    }
  }
};
