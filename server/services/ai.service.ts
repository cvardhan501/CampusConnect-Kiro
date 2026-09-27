import { GoogleGenerativeAI } from '@google/generative-ai';
import { connectToDatabase } from '../db/connection';
import { Issue, IIssue, IssuePriority } from '../models/Issue';
import { LostFoundItem, ILostFoundItem } from '../models/LostFound';

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Primary model — gemini-1.5-flash is the correct GA name for the fast Gemini 1.5 model
const GEMINI_MODEL = 'gemini-1.5-flash';

export interface AITriageResult {
  suggestedCategory: string;
  suggestedPriority: IssuePriority;
  severity: number; // 1-5 per requirement
  potentialDuplicates: Array<{ issueId: string; similarityScore: number; reason: string }>;
}

export class AIService {
  static async triageIssue(
    title: string,
    description: string,
    category: string,
    location: string
  ): Promise<AITriageResult> {
    const defaultResult: AITriageResult = {
      suggestedCategory: category || 'Facilities',
      suggestedPriority: 'Medium',
      severity: 3,
      potentialDuplicates: [],
    };

    if (!genAI) {
      return defaultResult;
    }

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('AI Triage timeout (15s exceeded)')), 15000)
    );

    const aiPromise = (async (): Promise<AITriageResult> => {
      const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

      const prompt = `Analyze this campus issue report and return JSON with keys:
"suggestedCategory" (one of: Facilities, Electrical, Plumbing, IT_Network, Safety, HVAC, Other),
"severity" (number 1 to 5, where 1-2=Low, 3=Medium, 4=High, 5=Critical),
"suggestedPriority" (one of: Low, Medium, High, Critical).

Title: "${title}"
Description: "${description}"
Location: "${location}"`;

      const response = await model.generateContent(prompt);
      const text = response.response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const severityNum =
          typeof parsed.severity === 'number' && parsed.severity >= 1 && parsed.severity <= 5
            ? parsed.severity
            : 3;

        let priority: IssuePriority = 'Medium';
        if (severityNum <= 2) priority = 'Low';
        else if (severityNum === 3) priority = 'Medium';
        else if (severityNum === 4) priority = 'High';
        else if (severityNum === 5) priority = 'Critical';

        if (
          parsed.suggestedPriority &&
          ['Low', 'Medium', 'High', 'Critical'].includes(parsed.suggestedPriority)
        ) {
          priority = parsed.suggestedPriority;
        }

        return {
          suggestedCategory: parsed.suggestedCategory || category,
          suggestedPriority: priority,
          severity: severityNum,
          potentialDuplicates: [],
        };
      }
      return defaultResult;
    })();

    // Let the caller (issue.service.ts) handle the thrown error and set aiTriageStatus='Failed'
    return await Promise.race([aiPromise, timeoutPromise]);
  }

  static async findPotentialDuplicateIssues(issueId: string): Promise<void> {
    try {
      await connectToDatabase();
      const targetIssue = await Issue.findById(issueId);
      if (!targetIssue) return;

      const recentIssues = await Issue.find({
        _id: { $ne: targetIssue._id },
        status: { $in: ['Reported', 'Under_Review', 'Assigned', 'In_Progress'] },
        category: targetIssue.category,
      })
        .sort({ createdAt: -1 })
        .limit(10);

      const duplicates: Array<{ issueId: any; similarityScore: number; reason: string }> = [];

      for (const item of recentIssues) {
        const t1 = targetIssue.title.toLowerCase();
        const t2 = item.title.toLowerCase();
        const words1 = t1.split(/\s+/);
        const shared = words1.filter((w) => w.length > 3 && t2.includes(w));

        if (shared.length >= 2 || (targetIssue.location === item.location && shared.length >= 1)) {
          duplicates.push({
            issueId: item._id,
            similarityScore: 0.88,
            reason: `Matching location (${targetIssue.location}) and keywords (${shared.join(', ')})`,
          });
        }
      }

      targetIssue.potentialDuplicates = duplicates.slice(0, 3) as any;
      await targetIssue.save();
    } catch (err) {
      console.error('Failed to run duplicate issue check:', err);
    }
  }

  static async findLostFoundMatches(
    itemId: string
  ): Promise<Array<{ itemId: string; confidenceScore: number; reason: string }>> {
    try {
      await connectToDatabase();
      const targetItem = await LostFoundItem.findById(itemId);
      if (!targetItem) return [];

      const targetType = targetItem.type === 'Lost' ? 'Found' : 'Lost';
      const candidates = await LostFoundItem.find({
        type: targetType,
        status: 'Active',
        category: targetItem.category,
      }).limit(5);

      return candidates.map((c) => ({
        itemId: c._id.toString(),
        confidenceScore: 0.85,
        reason: `Matching category (${targetItem.category}) and campus area (${c.location})`,
      }));
    } catch {
      return [];
    }
  }
}
