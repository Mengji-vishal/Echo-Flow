import { UserProgress, Assessment, TrainingModule, PracticePersona } from '../types';

export const mockUserProgress: UserProgress = {
  name: "Sarah Jenkins",
  role: "Customer Support Executive",
  avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
  assignedDomain: "Loans",
  level: 4,
  xp: 2450,
  xpNeeded: 3000,
  streak: 5,
  completedModulesCount: 8,
  completedAssessmentsCount: 12,
  metrics: {
    empathy: 92, // Strongest skill
    listening: 90,
    productKnowledge: 78,
    compliance: 95,
    closing: 74,
  },
  achievements: [
    {
      id: "ach_01",
      title: "First Practice",
      description: "Complete your first evaluated call scenario.",
      icon: "Award",
      unlockedAt: "2026-08-10"
    },
    {
      id: "ach_02",
      title: "7-Day Practice Streak",
      description: "Maintain a 7-day active practice and learning streak.",
      icon: "Flame",
      unlockedAt: "2026-08-12"
    },
    {
      id: "ach_03",
      title: "Excellent Empathy",
      description: "Earn an empathy rating above 90% for 3 consecutive calls.",
      icon: "Heart",
      unlockedAt: "2026-08-15"
    },
    {
      id: "ach_04",
      title: "Objection Handling Improved",
      description: "Boost your average objection handling score by 12% in a week.",
      icon: "ShieldCheck",
      unlockedAt: "2026-08-18"
    }
  ]
};

export const mockAssessments: Assessment[] = [
  {
    id: "asm_101",
    date: "2026-08-18 14:30",
    callTitle: "Billing Dispute - Service Renewal",
    customerPersona: "Frustrated Subscriber",
    duration: "3:45",
    overallScore: 87,
    status: "completed",
    metrics: {
      empathy: 90,
      listening: 95,
      productKnowledge: 75,
      compliance: 100,
      closing: 75,
    },
    transcript: [
      { speaker: "Customer", text: "Hello? I am calling because I noticed my monthly subscription charge jumped from $19 to $29. Nobody told me about this auto-increase!", timestamp: "0:05", sentiment: "negative" },
      { speaker: "Agent", text: "Hello, thank you for reaching out. I completely understand how frustrating it is to see an unexpected increase on your bill, and I would be happy to check what happened and assist you today.", timestamp: "0:15", sentiment: "positive" },
      { speaker: "Customer", text: "Yes, please do. It's ridiculous. I've been with you guys for a year and this is how you treat loyal customers?", timestamp: "0:25", sentiment: "negative" },
      { speaker: "Agent", text: "I hear you. Let me check your account details. It looks like your initial 12-month promotional discount expired on the 15th, which returned your plan to the standard monthly rate.", timestamp: "0:45", sentiment: "neutral" },
      { speaker: "Customer", text: "Wait, so there's no way to keep my old rate? I'll just cancel and go to a competitor if that's the case.", timestamp: "1:05", sentiment: "negative" },
      { speaker: "Agent", text: "I definitely don't want to lose you as a customer, Sarah. Let me look at alternative options. We actually have an annual renewal promotion running right now that locks in a rate of $22 per month if you pay annually.", timestamp: "1:25", sentiment: "positive" },
      { speaker: "Customer", text: "Paying annually... hmm, how much is that upfront?", timestamp: "1:45", sentiment: "neutral" },
      { speaker: "Agent", text: "It would be $264 upfront for the year. It works out to just $22 a month, saving you $84 compared to the standard monthly price.", timestamp: "2:05", sentiment: "positive" },
      { speaker: "Customer", text: "Okay, that's actually reasonable. Can you apply that discount to my current billing cycle so I don't pay the $29?", timestamp: "2:25", sentiment: "positive" },
      { speaker: "Agent", text: "Absolutely, I will reverse the current charge, apply the annual rate, and process the renewal right now. Before I finalize, I need to read our brief renewal agreement statement for compliance. Is that okay?", timestamp: "2:45", sentiment: "positive" },
      { speaker: "Customer", text: "Sure, go ahead.", timestamp: "3:05", sentiment: "positive" },
      { speaker: "Agent", text: "[Reads Compliance Statement] Perfect, the renewal is confirmed, and your invoice has been sent to your email. Is there anything else I can help you with today?", timestamp: "3:25", sentiment: "positive" },
      { speaker: "Customer", text: "No, that covers it. Thank you for fixing this so quickly.", timestamp: "3:35", sentiment: "positive" }
    ],
    feedback: {
      overall: "Excellent empathetic phrasing and outstanding active listening. Sarah was extremely calm and professional while managing a tense customer dispute. Compliance scripting was followed perfectly.",
      strengths: [
        "Strong empathy and reassurance phrases used right at the start.",
        "Excellent listening; did not interrupt the customer's explanation.",
        "Clean compliance read-out without rushing."
      ],
      improvements: [
        "Product knowledge could be sharper: took slightly long to locate the annual promotion option.",
        "Make sure to restate closing confirmation and confirm email delivery directly."
      ]
    }
  },
  {
    id: "asm_102",
    date: "2026-08-15 10:15",
    callTitle: "Personal Loan Inquiry",
    customerPersona: "First-time Applicant",
    duration: "8:42",
    overallScore: 86,
    status: "completed",
    metrics: {
      empathy: 92,
      listening: 90,
      productKnowledge: 80,
      compliance: 95,
      closing: 73,
    },
    transcript: [
      { speaker: "Customer", text: "Hi, I'm looking to take out a personal loan of about $15,000 for home remodeling. I want to check my eligibility and interest rates.", timestamp: "0:05", sentiment: "neutral" },
      { speaker: "Agent", text: "I can absolutely guide you through that. Home remodeling is a great investment. To check eligibility, we will look at your credit rating and debt-to-income ratio. Do you have a rough idea of your current credit range?", timestamp: "0:25", sentiment: "positive" },
      { speaker: "Customer", text: "Yes, it's around 720. I pay off my cards on time.", timestamp: "0:45", sentiment: "positive" },
      { speaker: "Agent", text: "Excellent, 720 is considered a very solid score. This puts you in our tier-1 interest rate bracket, which currently starts at 6.8% APR fixed.", timestamp: "1:05", sentiment: "positive" }
    ],
    feedback: {
      overall: "Solid discovery phase. You asked the right questions to qualify the lead and explained our interest rates clearly. Closing could be structured with a clearer call to action.",
      strengths: [
        "Strong product explanation.",
        "Clear disclosure of fixed APR policies."
      ],
      improvements: [
        "Be more assertive when asking for the formal application submit trigger."
      ]
    }
  },
  {
    id: "asm_103",
    date: "2026-08-17 11:00",
    callTitle: "Education Loan Inquiry",
    customerPersona: "Student Parent",
    duration: "7:15",
    overallScore: 84,
    status: "completed",
    metrics: {
      empathy: 95,
      listening: 88,
      productKnowledge: 78,
      compliance: 90,
      closing: 69,
    },
    transcript: [
      { speaker: "Customer", text: "Hello, my son got accepted to state college, and we need to cover the tuition deficit of $10,000. Do you offer student/parent loans?", timestamp: "0:04", sentiment: "neutral" },
      { speaker: "Agent", text: "Congratulations on his acceptance! That's a huge milestone. Yes, we offer parent-co-signed education loans with flexible deferment programs while he is in school.", timestamp: "0:25", sentiment: "positive" }
    ],
    feedback: {
      overall: "Outstanding empathy showing genuine congratulatory remarks. Discovery was warm and detailed. Closing techniques need review as no clear action follow-up was scheduled.",
      strengths: [
        "Exceptional empathy score.",
        "Clear outline of deferment schedules."
      ],
      improvements: [
        "Ensure compliance disclosures regarding co-signee liabilities are read clearly."
      ]
    }
  },
  {
    id: "asm_104",
    date: "2026-08-16 09:30",
    callTitle: "Home Loan Inquiry",
    customerPersona: "Home Buyer",
    duration: "6:30",
    overallScore: 72,
    status: "completed",
    metrics: {
      empathy: 88,
      listening: 70,
      productKnowledge: 65,
      compliance: 75,
      closing: 63,
    },
    transcript: [
      { speaker: "Customer", text: "I'm looking to buy a house in Real Estate sector 4. I need information on your 30-year fixed rate mortgage and down payment criteria.", timestamp: "0:06", sentiment: "neutral" },
      { speaker: "Agent", text: "I can help. For a 30-year mortgage, the standard rate is 7.2%. We require a minimum of 5% down payment. Do you have a pre-qualification letter?", timestamp: "0:30", sentiment: "neutral" }
    ],
    feedback: {
      overall: "Call outcome required a follow-up. Agent was slightly brief in product descriptions and missed key questions regarding the buyer's budget cap. Closing was weak.",
      strengths: [
        "Followed identity protocols."
      ],
      improvements: [
        "Explain mortgage insurance terms if down payments are below 20%.",
        "Maintain active listening; do not rush to close details before confirming buyer's timeline."
      ]
    }
  },
  {
    id: "asm_105",
    date: "2026-08-14 16:15",
    callTitle: "Auto Insurance Quote",
    customerPersona: "Skeptical Driver",
    duration: "5:12",
    overallScore: 91,
    status: "completed",
    metrics: {
      empathy: 94,
      listening: 92,
      productKnowledge: 90,
      compliance: 96,
      closing: 83,
    },
    transcript: [
      { speaker: "Customer", text: "I have a clean driving record and I am paying $120 a month with my current provider. Can you beat that for a standard sedan?", timestamp: "0:05", sentiment: "neutral" },
      { speaker: "Agent", text: "With a clean record, you qualify for our Safe Driver discount. Let's look at matching that coverage. I can set you up with comprehensive coverage at $98 a month. That saves you $22 monthly.", timestamp: "0:25", sentiment: "positive" }
    ],
    feedback: {
      overall: "Superb call execution. Prompt objection handling and swift closing. Showed great confidence and clarity.",
      strengths: [
        "Swift value statement calculation.",
        "Polished objection deflection."
      ],
      improvements: [
        "Include roadside assistance add-on options more explicitly during closing."
      ]
    }
  },
  {
    id: "asm_106",
    date: "2026-08-19 11:00",
    callTitle: "B2B SaaS License Audit",
    customerPersona: "Corporate Buyer",
    duration: "4:15",
    overallScore: 0,
    status: "pending",
    metrics: {
      empathy: 0,
      listening: 0,
      productKnowledge: 0,
      compliance: 0,
      closing: 0,
    },
    transcript: [],
    feedback: {
      overall: "Assessment has not been processed. This call is pending AI evaluation.",
      strengths: [],
      improvements: []
    }
  }
];

export const mockTrainingModules: TrainingModule[] = [
  {
    id: "trn_201",
    title: "FCRA Compliance Essentials",
    description: "Learn the mandatory procedures for handling customer credit records under the Fair Credit Reporting Act.",
    category: "Compliance",
    estimatedMinutes: 30,
    progress: 100,
    status: "completed",
    lessons: [
      { id: "les_1", title: "Introduction to FCRA Standards", duration: "8 mins", isCompleted: true, content: "The Fair Credit Reporting Act (FCRA) is a federal law that regulates the collection, dissemination, and use of consumer information..." },
      { id: "les_2", title: "Verification Procedures", duration: "12 mins", isCompleted: true, content: "Always verify identity using at least 3 points of authentication (Name, Account number, and Last 4 of SSN or Security Token) before disclosing details..." },
      { id: "les_3", title: "Compliance Quick Quiz", duration: "10 mins", isCompleted: true, content: "A knowledge checkpoint reviewing identity verification, dispute protocols, and standard mandatory disclosure clauses." }
    ]
  },
  {
    id: "trn_202",
    title: "Handling Price Objections",
    description: "Frameworks for reframing billing objections, justifying standard costs, and pitching the product value.",
    category: "Objection Handling",
    estimatedMinutes: 45,
    progress: 66,
    status: "unlocked",
    lessons: [
      { id: "les_4", title: "The Psychology of Cost Objections", duration: "15 mins", isCompleted: true, content: "Objections about cost are usually objections about perceived value. If a customer is complaining that your rate is too expensive, they don't see the direct value return yet..." },
      { id: "les_5", title: "LAER Framework (Objections)", duration: "15 mins", isCompleted: true, content: "Listen, Acknowledge, Explore, and Respond (LAER). Apply this method to systematically disarm pricing complaints instead of arguing..." },
      { id: "les_6", title: "Objections Scenario Quiz", duration: "15 mins", isCompleted: false, content: "Listen to call recordings, evaluate agent responses, and choose the response that best maps features to business ROI." }
    ]
  },
  {
    id: "trn_203",
    title: "Advanced Discovery Questions",
    description: "Learn how to ask open-ended questions that unlock deep customer needs and lead qualification details.",
    category: "Soft Skills",
    estimatedMinutes: 25,
    progress: 0,
    status: "unlocked",
    lessons: [
      { id: "les_7", title: "The Power of Open-Ended Prompts", duration: "10 mins", isCompleted: false, content: "Avoid yes/no traps. Start questions with 'What', 'How', or 'Could you describe...' to encourage customers to share their actual hurdles..." },
      { id: "les_8", title: "Discovery-to-Proposal Mapping", duration: "15 mins", isCompleted: false, content: "How to connect a customer's specific answers directly into your final loan option pitches." }
    ]
  },
  {
    id: "trn_204",
    title: "Closing Techniques",
    description: "Review assertive closing frameworks, scheduling co-signee checks, and confirming client agreement.",
    category: "Product Training",
    estimatedMinutes: 40,
    progress: 0,
    status: "locked",
    lessons: [
      { id: "les_9", title: "The Assumptive Close", duration: "15 mins", isCompleted: false, content: "Guide the customer through the next logical step rather than asking permission. 'Let's schedule your document review for Tuesday morning'..." },
      { id: "les_10", title: "Regulatory Confirmations", duration: "25 mins", isCompleted: false, content: "Fulfill audit requirements during closure, confirming interest rate indexes and down payment disclosures." }
    ]
  }
];

export const mockPracticePersonas: PracticePersona[] = [
  {
    id: "prc_01",
    name: "Frustrated Frank",
    role: "Small Business Owner",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150",
    difficulty: "Beginner",
    sentiment: "Frustrated",
    scenario: "Billing error on his account where his payment was double-charged, making his check bounce.",
    objections: [
      "I want a full refund and compensation for my overdraft fee.",
      "Your billing system is unreliable, why should I trust you guys?"
    ]
  },
  {
    id: "prc_02",
    name: "Skeptical Sarah",
    role: "Operations Director",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150",
    difficulty: "Intermediate",
    sentiment: "Skeptical",
    scenario: "Reviewing standard service level agreement renewals and questions the price increase vs feature value.",
    objections: [
      "Competitors offer the exact same tools for half this price.",
      "Explain exactly what changes justify a 15% increase in licensing costs."
    ]
  },
  {
    id: "prc_03",
    name: "Corporate Carl",
    role: "IT Procurement Officer",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
    difficulty: "Advanced",
    sentiment: "Inquisitive",
    scenario: "Demands complex multi-tenant details, data compliance guidelines, and a custom billing breakdown.",
    objections: [
      "Are you SOC2 Type II compliant, and can you share the certification?",
      "We need a custom invoicing cycle, our accounts payable won't pay on standard credit card auto-renewal."
    ]
  }
];
