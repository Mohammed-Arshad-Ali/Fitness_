/**
 * VITA:ON Gemini AI Service
 * 
 * This service integrates Google's Gemini Flash 2.0 for Digital Twin AI features.
 * 
 * ============================================
 * 📍 GEMINI API KEY LOCATION: .env.local
 *    Variable: GEMINI_API_KEY
 * ============================================
 */

// ============================================
// PLACEHOLDER: Add your Gemini API Key in .env.local
// GEMINI_API_KEY=your_gemini_api_key_here
// ============================================

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Types for Gemini responses
interface GeminiMessage {
    role: 'user' | 'model';
    parts: { text: string }[];
}

interface GeminiResponse {
    candidates: {
        content: {
            parts: { text: string }[];
        };
        finishReason: string;
    }[];
    usageMetadata: {
        promptTokenCount: number;
        candidatesTokenCount: number;
        totalTokenCount: number;
    };
}

interface BiometricData {
    heartRate?: number;
    hrv?: number;
    glucose?: number;
    sleepScore?: number;
    recoveryScore?: number;
    strain?: number;
    steps?: number;
    bodyTemperature?: number;
    respiratoryRate?: number;
}

interface DigitalTwinPrediction {
    energyLevel: number; // 0-100
    cognitiveScore: number; // 0-100
    stressLevel: 'low' | 'moderate' | 'high';
    optimalWorkoutWindow: string;
    recommendations: string[];
    alerts: string[];
    confidence: number;
}

interface ProtocolRecommendation {
    protocolType: string;
    name: string;
    description: string;
    optimalTime: string;
    duration: string;
    intensity: 'low' | 'moderate' | 'high';
    reasoning: string;
}

interface AIInsight {
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    category: 'health' | 'performance' | 'recovery' | 'nutrition' | 'sleep';
    actionable: boolean;
    action?: string;
}

/**
 * Check if Gemini API is configured
 */
export function isGeminiConfigured(): boolean {
    return GEMINI_API_KEY.length > 0;
}

/**
 * Call Gemini API with a prompt
 */
async function callGemini(
    prompt: string,
    systemInstruction?: string,
    temperature: number = 0.7
): Promise<string> {
    // ============================================
    // PLACEHOLDER: GEMINI API CALL
    // If API key is not configured, return mock data
    // ============================================

    if (!isGeminiConfigured()) {
        console.warn('[GEMINI] API key not configured. Using mock responses.');
        console.warn('[GEMINI] Add GEMINI_API_KEY to your .env.local file');
        return JSON.stringify({ mock: true, message: 'Configure GEMINI_API_KEY in .env.local' });
    }

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [
                    {
                        role: 'user',
                        parts: [{ text: prompt }],
                    },
                ],
                systemInstruction: systemInstruction ? {
                    parts: [{ text: systemInstruction }],
                } : undefined,
                generationConfig: {
                    temperature,
                    topP: 0.95,
                    topK: 40,
                    maxOutputTokens: 2048,
                    responseMimeType: 'application/json',
                },
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('[GEMINI] API Error:', error);
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const data: GeminiResponse = await response.json();
        return data.candidates[0]?.content?.parts[0]?.text || '';
    } catch (error) {
        console.error('[GEMINI] Request failed:', error);
        throw error;
    }
}

/**
 * Generate Digital Twin predictions based on biometric data
 * 
 * ============================================
 * 📍 GEMINI API USED HERE
 * ============================================
 */
export async function generateDigitalTwinPredictions(
    biometrics: BiometricData,
    userHistory?: string
): Promise<DigitalTwinPrediction> {
    const systemInstruction = `You are VITA:ON's Digital Twin AI, a sophisticated biological prediction engine.
Analyze the user's biometric data and provide accurate predictions for their energy, cognitive performance, and optimal activity windows.
Always respond in valid JSON format matching the DigitalTwinPrediction schema.
Be specific, actionable, and science-based in your recommendations.`;

    const prompt = `Analyze these biometrics and predict the user's biological state for the next 24 hours:

Current Biometrics:
- Heart Rate: ${biometrics.heartRate || 'N/A'} bpm
- HRV: ${biometrics.hrv || 'N/A'} ms  
- Blood Glucose: ${biometrics.glucose || 'N/A'} mg/dL
- Sleep Score: ${biometrics.sleepScore || 'N/A'}/100
- Recovery Score: ${biometrics.recoveryScore || 'N/A'}%
- Strain: ${biometrics.strain || 'N/A'}
- Steps Today: ${biometrics.steps || 'N/A'}
- Body Temperature: ${biometrics.bodyTemperature || 'N/A'}°F
- Respiratory Rate: ${biometrics.respiratoryRate || 'N/A'} breaths/min

${userHistory ? `User History: ${userHistory}` : ''}

Return a JSON object with:
{
  "energyLevel": number (0-100),
  "cognitiveScore": number (0-100),
  "stressLevel": "low" | "moderate" | "high",
  "optimalWorkoutWindow": "HH:MM - HH:MM",
  "recommendations": ["recommendation1", "recommendation2", ...],
  "alerts": ["alert1", ...] (only if needed),
  "confidence": number (0-1)
}`;

    // ============================================
    // PLACEHOLDER: GEMINI PREDICTION
    // When Gemini is not configured, return mock data
    // ============================================

    if (!isGeminiConfigured()) {
        // Mock prediction based on biometrics
        const mockPrediction: DigitalTwinPrediction = {
            energyLevel: biometrics.recoveryScore || 75,
            cognitiveScore: Math.min(100, (biometrics.sleepScore || 80) + 5),
            stressLevel: (biometrics.hrv || 50) > 50 ? 'low' : 'moderate',
            optimalWorkoutWindow: '17:00 - 19:00',
            recommendations: [
                `Based on your recovery score of ${biometrics.recoveryScore || 'moderate'}%, consider a moderate-intensity workout`,
                'Stay hydrated - aim for 3 liters today',
                'Your HRV indicates good parasympathetic recovery',
            ],
            alerts: biometrics.glucose && biometrics.glucose < 70
                ? ['Low glucose detected - consider a healthy snack']
                : [],
            confidence: 0.85,
        };
        return mockPrediction;
    }

    try {
        const response = await callGemini(prompt, systemInstruction, 0.7);
        return JSON.parse(response) as DigitalTwinPrediction;
    } catch (error) {
        console.error('[GEMINI] Prediction error:', error);
        // Return safe defaults on error
        return {
            energyLevel: 70,
            cognitiveScore: 70,
            stressLevel: 'moderate',
            optimalWorkoutWindow: '17:00 - 19:00',
            recommendations: ['Unable to generate AI predictions. Check your API configuration.'],
            alerts: [],
            confidence: 0,
        };
    }
}

/**
 * Get personalized protocol recommendations
 * 
 * ============================================
 * 📍 GEMINI API USED HERE
 * ============================================
 */
export async function getProtocolRecommendations(
    biometrics: BiometricData,
    goals: string[],
    currentProtocols: string[]
): Promise<ProtocolRecommendation[]> {
    const systemInstruction = `You are VITA:ON's Protocol Engine, an AI that designs personalized health optimization protocols.
Based on the user's biometrics, goals, and current protocols, recommend new protocols that would benefit them.
Always respond in valid JSON array format.`;

    const prompt = `Based on this user's data, recommend 3 new protocols:

Biometrics:
- HRV: ${biometrics.hrv || 'N/A'} ms
- Sleep Score: ${biometrics.sleepScore || 'N/A'}
- Recovery: ${biometrics.recoveryScore || 'N/A'}%

User Goals: ${goals.join(', ') || 'General wellness'}
Current Protocols: ${currentProtocols.join(', ') || 'None'}

Return a JSON array of protocol recommendations:
[{
  "protocolType": "workout" | "nutrition" | "sleep" | "meditation" | "cold_exposure" | "breathwork",
  "name": "Protocol Name",
  "description": "Brief description",
  "optimalTime": "HH:MM",
  "duration": "X minutes",
  "intensity": "low" | "moderate" | "high",
  "reasoning": "Why this protocol would help"
}]`;

    // ============================================
    // PLACEHOLDER: GEMINI PROTOCOL RECOMMENDATIONS
    // ============================================

    if (!isGeminiConfigured()) {
        return [
            {
                protocolType: 'cold_exposure',
                name: 'Morning Cold Shower',
                description: '3-minute cold water exposure to boost metabolism and alertness',
                optimalTime: '06:30',
                duration: '3 minutes',
                intensity: 'moderate',
                reasoning: 'Cold exposure increases norepinephrine and improves recovery metrics',
            },
            {
                protocolType: 'breathwork',
                name: 'Box Breathing Session',
                description: '4-4-4-4 breathing pattern for stress reduction',
                optimalTime: '12:00',
                duration: '10 minutes',
                intensity: 'low',
                reasoning: 'Midday breathwork can improve HRV and reduce cortisol',
            },
            {
                protocolType: 'sleep',
                name: 'Wind-Down Routine',
                description: 'Blue light blocking and temperature reduction before bed',
                optimalTime: '21:00',
                duration: '60 minutes',
                intensity: 'low',
                reasoning: 'Optimizing sleep environment improves deep sleep percentage',
            },
        ];
    }

    try {
        const response = await callGemini(prompt, systemInstruction, 0.8);
        return JSON.parse(response) as ProtocolRecommendation[];
    } catch (error) {
        console.error('[GEMINI] Protocol recommendation error:', error);
        return [];
    }
}

/**
 * Analyze biometric anomalies and generate insights
 * 
 * ============================================
 * 📍 GEMINI API USED HERE
 * ============================================
 */
export async function analyzeBiometricAnomalies(
    currentBiometrics: BiometricData,
    historicalAverages: BiometricData
): Promise<AIInsight[]> {
    const systemInstruction = `You are VITA:ON's Health Analysis AI. 
Analyze biometric data for anomalies compared to the user's historical averages.
Identify patterns that may indicate health issues, stress, or opportunities for optimization.
Be helpful but not alarmist. Always respond in JSON array format.`;

    const prompt = `Compare current biometrics to historical averages and identify insights:

Current:
${JSON.stringify(currentBiometrics, null, 2)}

Historical Averages:
${JSON.stringify(historicalAverages, null, 2)}

Return JSON array of insights:
[{
  "title": "Short title",
  "description": "Detailed explanation",
  "priority": "low" | "medium" | "high" | "urgent",
  "category": "health" | "performance" | "recovery" | "nutrition" | "sleep",
  "actionable": boolean,
  "action": "Suggested action if actionable"
}]`;

    // ============================================
    // PLACEHOLDER: GEMINI ANOMALY ANALYSIS
    // ============================================

    if (!isGeminiConfigured()) {
        const insights: AIInsight[] = [];

        // Generate mock insights based on data comparison
        if (currentBiometrics.hrv && historicalAverages.hrv) {
            const hrvDiff = currentBiometrics.hrv - historicalAverages.hrv;
            if (Math.abs(hrvDiff) > 10) {
                insights.push({
                    title: hrvDiff > 0 ? 'HRV Improvement Detected' : 'HRV Below Average',
                    description: `Your HRV is ${Math.abs(hrvDiff).toFixed(0)}ms ${hrvDiff > 0 ? 'above' : 'below'} your usual baseline.`,
                    priority: hrvDiff > 0 ? 'low' : 'medium',
                    category: 'recovery',
                    actionable: hrvDiff < 0,
                    action: hrvDiff < 0 ? 'Consider reducing workout intensity today' : undefined,
                });
            }
        }

        if (currentBiometrics.sleepScore && historicalAverages.sleepScore) {
            if (currentBiometrics.sleepScore < historicalAverages.sleepScore - 10) {
                insights.push({
                    title: 'Sleep Quality Declined',
                    description: 'Your sleep score is notably lower than your average. This may affect recovery and performance.',
                    priority: 'medium',
                    category: 'sleep',
                    actionable: true,
                    action: 'Try going to bed 30 minutes earlier tonight',
                });
            }
        }

        return insights;
    }

    try {
        const response = await callGemini(prompt, systemInstruction, 0.6);
        return JSON.parse(response) as AIInsight[];
    } catch (error) {
        console.error('[GEMINI] Anomaly analysis error:', error);
        return [];
    }
}

/**
 * Generate personalized intervention message for real-time alerts
 * 
 * ============================================
 * 📍 GEMINI API USED HERE
 * ============================================
 */
export async function generateIntervention(
    alertType: 'glucose_low' | 'glucose_high' | 'stress_high' | 'recovery_low' | 'sleep_debt',
    currentValue: number,
    context?: string
): Promise<{ message: string; suggestion: string; urgency: 'info' | 'warning' | 'critical' }> {
    const systemInstruction = `You are VITA:ON's real-time intervention AI.
Generate helpful, calm, and actionable messages for health alerts.
Keep messages concise but informative. Never cause panic.`;

    const prompt = `Generate an intervention message for:
Alert Type: ${alertType}
Current Value: ${currentValue}
Context: ${context || 'N/A'}

Return JSON:
{
  "message": "Brief alert message",
  "suggestion": "Actionable suggestion",
  "urgency": "info" | "warning" | "critical"
}`;

    // ============================================
    // PLACEHOLDER: GEMINI INTERVENTION
    // ============================================

    if (!isGeminiConfigured()) {
        const interventions: Record<string, { message: string; suggestion: string; urgency: 'info' | 'warning' | 'critical' }> = {
            glucose_low: {
                message: `Your glucose is at ${currentValue} mg/dL, which is below optimal.`,
                suggestion: 'Consider having a healthy snack with complex carbs and protein.',
                urgency: currentValue < 60 ? 'critical' : 'warning',
            },
            glucose_high: {
                message: `Your glucose spiked to ${currentValue} mg/dL.`,
                suggestion: 'A short walk can help stabilize blood sugar levels.',
                urgency: currentValue > 180 ? 'warning' : 'info',
            },
            stress_high: {
                message: 'Elevated stress detected based on your biometrics.',
                suggestion: 'Try a 2-minute breathing exercise: 4 seconds in, 6 seconds out.',
                urgency: 'warning',
            },
            recovery_low: {
                message: `Your recovery score is ${currentValue}%, indicating incomplete recovery.`,
                suggestion: 'Consider reducing workout intensity today and prioritizing rest.',
                urgency: currentValue < 30 ? 'warning' : 'info',
            },
            sleep_debt: {
                message: 'Sleep debt accumulating. Your body needs more rest.',
                suggestion: 'Aim for 8 hours tonight and avoid screens 1 hour before bed.',
                urgency: 'info',
            },
        };

        return interventions[alertType] || {
            message: 'Health metric requires attention.',
            suggestion: 'Review your biometrics dashboard for details.',
            urgency: 'info',
        };
    }

    try {
        const response = await callGemini(prompt, systemInstruction, 0.5);
        return JSON.parse(response);
    } catch (error) {
        console.error('[GEMINI] Intervention generation error:', error);
        return {
            message: 'Health alert detected.',
            suggestion: 'Please review your biometrics.',
            urgency: 'info',
        };
    }
}

/**
 * Chat with Digital Twin AI
 * 
 * ============================================
 * 📍 GEMINI API USED HERE - MAIN CHAT INTERFACE
 * ============================================
 */
export async function chatWithDigitalTwin(
    message: string,
    biometrics: BiometricData,
    conversationHistory: { role: 'user' | 'assistant'; content: string }[]
): Promise<string> {
    const systemInstruction = `You are the user's Digital Twin - an AI representation of their biological self.
Speak in first person as if you ARE the user's body and mind.
You have access to their real-time biometrics and can provide insights about their health.
Be helpful, personable, and science-based. Keep responses concise.

Current Biometrics:
- Heart Rate: ${biometrics.heartRate || 'N/A'} bpm
- HRV: ${biometrics.hrv || 'N/A'} ms
- Glucose: ${biometrics.glucose || 'N/A'} mg/dL
- Sleep Score: ${biometrics.sleepScore || 'N/A'}
- Recovery: ${biometrics.recoveryScore || 'N/A'}%`;

    const historyText = conversationHistory
        .slice(-6) // Last 6 messages for context
        .map(m => `${m.role === 'user' ? 'User' : 'Digital Twin'}: ${m.content}`)
        .join('\n');

    const prompt = `${historyText ? `Conversation History:\n${historyText}\n\n` : ''}User: ${message}\n\nDigital Twin:`;

    // ============================================
    // PLACEHOLDER: GEMINI CHAT
    // ============================================

    if (!isGeminiConfigured()) {
        return `I'm your Digital Twin, but I need to be fully activated. Please add your Gemini API key to the environment variables (GEMINI_API_KEY in .env.local) to unlock my full capabilities. In the meantime, I can tell you that your current biometrics look ${(biometrics.recoveryScore || 70) > 70 ? 'good' : 'like you could use some rest'}.`;
    }

    try {
        // For chat, we want raw text not JSON
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                systemInstruction: { parts: [{ text: systemInstruction }] },
                generationConfig: {
                    temperature: 0.8,
                    maxOutputTokens: 512,
                },
            }),
        });

        if (!response.ok) throw new Error('Gemini API error');

        const data: GeminiResponse = await response.json();
        return data.candidates[0]?.content?.parts[0]?.text || 'I could not process that. Please try again.';
    } catch (error) {
        console.error('[GEMINI] Chat error:', error);
        return 'I encountered an issue. Please check the API configuration.';
    }
}

// Export all services
export const GeminiService = {
    isConfigured: isGeminiConfigured,
    generateDigitalTwinPredictions,
    getProtocolRecommendations,
    analyzeBiometricAnomalies,
    generateIntervention,
    chatWithDigitalTwin,
};

export default GeminiService;
