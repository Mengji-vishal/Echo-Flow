import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, PhoneOff, Sparkles, Smile, Frown } from 'lucide-react';
import { PracticeScenarioInfo } from '../../components/practice/PracticeCard';
import { AudioWaveform } from '../../components/practice/AudioWaveform';
import { TranscriptLine } from '../../../../../shared/types';

interface LivePracticeProps {
  scenario: PracticeScenarioInfo;
  onHangUp: () => void;
  onFinish: (results: {
    score: number;
    breakdown: {
      empathy: number;
      communication: number;
      discovery: number;
      objectionHandling: number;
      solutionOffering: number;
      closing: number;
      compliance: number;
    };
    feedback: {
      summary: string;
      strengths: string[];
      improvements: string[];
    };
  }) => void;
}

export const LivePractice: React.FC<LivePracticeProps> = ({ scenario, onHangUp, onFinish }) => {
  const [callState, setCallState] = useState<'connecting' | 'active' | 'completed'>('connecting');
  const [isMicActive, setIsMicActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [customerMood, setCustomerMood] = useState(50);
  const [transcript, setTranscript] = useState<TranscriptLine[]>([]);
  const [seconds, setSeconds] = useState(0);
  const [simStep, setSimStep] = useState(0);
  const [coachHint, setCoachHint] = useState('Wait for the customer to present their case.');
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // Timer counter
  useEffect(() => {
    if (callState !== 'active') return;
    const interval = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [callState]);

  // Scroll transcript to bottom
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  // Initializing caller dialog
  useEffect(() => {
    const timer = setTimeout(() => {
      setCallState('active');
      const intro = getIntroDialog(scenario.id);
      setTranscript([
        { speaker: 'Customer', text: intro, timestamp: '0:02', sentiment: 'negative' }
      ]);
      setCustomerMood(scenario.difficulty === 'Easy' ? 60 : scenario.difficulty === 'Medium' ? 40 : 25);
      setCoachHint(getInitialHint(scenario.id));
      setIsSpeaking(true);
      
      // Stop customer speaking after 2s
      setTimeout(() => setIsSpeaking(false), 2000);
    }, 1500);

    return () => clearTimeout(timer);
  }, [scenario]);

  const getIntroDialog = (id: string) => {
    if (id === 'prc_01') return "Hi, I just saw your interest rate quote for our personal loan refinancing and I'm shocked. Why is it 7.2% APR? Another bank is quoting 6.5%.";
    if (id === 'prc_02') return "Yeah, hi! My account payment was double-charged this morning, which overdrafted my bank balance! You guys need to fix this and refund my bank fees immediately.";
    if (id === 'prc_03') return "Hello, I need details on home financing options. I'm looking to remodel our back patio, but I want to make sure I qualify for low rates.";
    return "Hi, we are co-signing a loan for our daughter's college tuition and we need to verify co-signee liabilities, deferment structures, and interest indexes. Can you run me through the disclosure statements?";
  };

  const getInitialHint = (id: string) => {
    if (id === 'prc_01') return "Acknowledge the rate variance before explaining. Validate their cost concerns and try using the LAER framework.";
    if (id === 'prc_02') return "Acknowledge their distress. Apologize sincerely for the double billing before pulling up their record.";
    if (id === 'prc_03') return "Confirm parent/student terms. Ask open discovery questions about their total project budget range.";
    return "Confirm co-signee terms. Reassure them that we follow FCRA guidelines and ask to verify their identity code.";
  };

  const getDialogueOptions = () => {
    if (scenario.id === 'prc_01') {
      if (simStep === 0) {
        return [
          { text: "I understand that seeing a rate difference can be surprising. The rate supports our fixed APR safety indices. Let's see if we can check your specific credit profile details.", scoreVal: 20, hint: "Excellent! Reassuring and objective." },
          { text: "Well, mortgage and loan rates fluctuate based on federal guidelines. There's not much I can do about rate index averages.", scoreVal: -15, hint: "A bit brief. Try validating their budget concerns more gently." },
          { text: "We actually have a 15-year fixed refinancing option that offers lower total interest, saving you money over time. Would you like to review that choice?", scoreVal: 10, hint: "Direct pitch. Good, but try acknowledging the cost variance first next time." }
        ];
      }
      return [
        { text: "Perfect. I can draft that fixed-rate refinance agreement right now and email the confirmation disclosure directly. Does that sound like a solid plan?", scoreVal: 20, hint: "Assertive closing. Excellent." },
        { text: "If you don't lock in this rate today, it might fluctuate further by tomorrow morning.", scoreVal: -25, hint: "Too defensive! That raises cancellation risks." }
      ];
    }

    if (scenario.id === 'prc_02') {
      if (simStep === 0) {
        return [
          { text: "I am so sorry for that billing bounce. That sounds incredibly stressful. I will pull up your transaction logs right now and issue the reversal. Can I verify your name?", scoreVal: 25, hint: "Outstanding empathy! Active listening score maximized." },
          { text: "Billing cycles are handled by our standard processor. Let me look if there's any bounce logs in our system.", scoreVal: -10, hint: "Avoid placing blame on processing systems. Take ownership of the error." }
        ];
      }
      return [
        { text: "The refund has been completed. Also, I am applying a $25 service credit to your account to fully cover the bank's overdraft fee as a gesture of goodwill.", scoreVal: 25, hint: "Excellent resolution support!" },
        { text: "I've reversed the charge, but bank fees are between you and your bank. We aren't responsible for that portion.", scoreVal: -20, hint: "Declining support for overdraft fees hurts customer retention." }
      ];
    }

    // Default discovery/co-signee compliance options
    if (simStep === 0) {
      return [
        { text: "Yes, I can absolutely run you through the co-signee disclosures. I will dispatch our standard FCRA liability statement to your email. May I verify your identity code?", scoreVal: 20, hint: "Clean compliance checklist followed." },
        { text: "We might have disclosures, but I'll need to contact our loan officers and get back to you later.", scoreVal: -5, hint: "Try showing confident compliance knowledge." }
      ];
    }
    return [
      { text: "I've sent the disclosure statements over. I will also log a scheduled calendar check next week to review any questions. Is there anything else I can check?", scoreVal: 15, hint: "Polished closing." }
    ];
  };

  const handleOptionSelect = (optionText: string, scoreVal: number, feedbackHint: string) => {
    // 1. Add Agent response
    setTranscript(prev => [...prev, {
      speaker: 'Agent',
      text: optionText,
      timestamp: formatTime(seconds),
      sentiment: 'positive'
    }]);

    // 2. Adjust Customer Mood
    const newMood = Math.max(0, Math.min(100, customerMood + scoreVal));
    setCustomerMood(newMood);
    setCoachHint(feedbackHint);

    // 3. Simulate Customer Response
    setSimStep(prev => prev + 1);
    setIsSpeaking(true);

    setTimeout(() => {
      setIsSpeaking(false);
      triggerCustomerDialog(newMood);
    }, 1500);
  };

  const triggerCustomerDialog = (moodVal: number) => {
    const nextStep = simStep + 1;
    let customerReply = '';
    let isDone = false;

    if (scenario.id === 'prc_01') {
      if (nextStep === 1) {
        if (moodVal > 45) {
          customerReply = "Okay, a 15-year term could work, but can you show me the exact numbers? I need to make sure the monthly payment is manageable.";
          setCoachHint("Present the financial savings of the 15-year fixed refinancing structure clearly.");
        } else {
          customerReply = "I don't know, this is still expensive. Other banks are quoting 6.5% standard refinancing with lower originations.";
          setCoachHint("Objection: competitor pricing. Remind them of our fixed rate stability indices and lower lifetime interest.");
        }
      } else {
        customerReply = moodVal >= 60 
          ? "Great, that refinance layout makes sense. Go ahead and email that agreement, I'll review and sign."
          : "Okay, just send me the standard rate sheet then. Good bye.";
        isDone = true;
      }
    } else if (scenario.id === 'prc_02') {
      if (nextStep === 1) {
        customerReply = "Thank you. I appreciate you taking the fee issue seriously. Will the credit show up on my billing statements directly?";
        setCoachHint("Confirm that the credit is applied instantly and verify email invoice details.");
      } else {
        customerReply = "Alright, thank you for resolving this and applying the credit. Have a good day.";
        isDone = true;
      }
    } else {
      // Compliance/Discovery
      if (nextStep === 1) {
        customerReply = "Great, I see the disclosure package in my inbox. That's exactly what we need to sign and defer the loan.";
        isDone = true;
      }
    }

    if (customerReply) {
      setTranscript(prev => [...prev, {
        speaker: 'Customer',
        text: customerReply,
        timestamp: formatTime(seconds),
        sentiment: moodVal > 45 ? 'positive' : 'negative'
      }]);
    }

    if (isDone) {
      setCallState('completed');
    }
  };

  const handleShowResults = () => {
    // Generate results payload
    const finalScore = Math.max(60, Math.min(100, 75 + Math.round(customerMood / 4)));
    onFinish({
      score: finalScore,
      breakdown: {
        empathy: scenario.id === 'prc_02' ? 95 : 85,
        communication: 88,
        discovery: scenario.id === 'prc_03' ? 90 : 75,
        objectionHandling: finalScore,
        solutionOffering: 80,
        closing: finalScore >= 80 ? 85 : 70,
        compliance: 95
      },
      feedback: {
        summary: finalScore >= 85 
          ? "Excellent work! You defused customer tension with exceptional active listening, structured explanations, and compliant closing statements."
          : "Solid performance, but there are areas to improve. Focus on validating objections before diving directly into standard product pitches.",
        strengths: [
          scenario.id === 'prc_02' ? "Strong empathy validation during billing bounces." : "Clear rate breakdown explaining refinancing value.",
          "Polished identity verification checks."
        ],
        improvements: [
          "Be more assertive when summarizing final annual savings options.",
          "Ensure compliance scripting is read completely without pacing issues."
        ]
      }
    });
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="live-practice-dark">
      {/* Simulation Header */}
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          paddingBottom: '1rem',
          marginBottom: '2rem'
        }}
      >
        <div>
          <span className="badge-tag badge-tag-info" style={{ fontSize: '0.65rem', marginBottom: '0.25rem' }}>AI CALL SIMULATOR</span>
          <h1 style={{ fontSize: '1.5rem', color: 'white' }}>{scenario.title}</h1>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Target skill: {scenario.targetSkill}</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>Session Timer</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#ffffff' }}>{formatTime(seconds)}</div>
          </div>
          <button className="btn btn-danger" style={{ padding: '0.5rem 1rem' }} onClick={onHangUp}>
            <PhoneOff size={16} />
            End Practice
          </button>
        </div>
      </div>

      {/* Main Console Split */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', flex: 1, alignItems: 'stretch' }}>
        
        {/* Left Side: Call dialogue and controls */}
        <div className="dark-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', justifyContent: 'space-between' }}>
          
          {/* Customer Avatar & Mood */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>👤</div>
              <div>
                <h3 style={{ fontSize: '0.95rem', color: 'white' }}>{scenario.customerPersona}</h3>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>AI Customer</span>
              </div>
            </div>

            {/* Mood status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {customerMood < 40 ? <Frown size={18} color="#ef4444" /> : <Smile size={18} color="#10b981" />}
              <div style={{ width: '120px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#94a3b8', marginBottom: '0.15rem' }}>
                  <span>Customer Satisfaction</span>
                  <span>{customerMood}%</span>
                </div>
                <div className="progress-bar-track" style={{ height: '4px', backgroundColor: 'rgba(255,255,255,0.08)' }}>
                  <div className="progress-bar-fill" style={{ width: `${customerMood}%`, backgroundColor: customerMood >= 70 ? '#10b981' : customerMood >= 40 ? 'var(--primary)' : '#ef4444' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Scrolling Transcript Dialog */}
          <div style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)', padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '200px' }}>
            {transcript.map((line, idx) => (
              <div 
                key={idx} 
                style={{ 
                  alignSelf: line.speaker === 'Agent' ? 'flex-end' : 'flex-start',
                  maxWidth: '80%',
                  backgroundColor: line.speaker === 'Agent' ? 'rgba(79, 70, 229, 0.15)' : 'rgba(255,255,255,0.02)',
                  border: '1px solid',
                  borderColor: line.speaker === 'Agent' ? 'rgba(79, 70, 229, 0.3)' : 'rgba(255,255,255,0.06)',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: 700, color: line.speaker === 'Agent' ? '#818cf8' : '#c084fc', marginBottom: '0.2rem' }}>
                  <span>{line.speaker}</span>
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>{line.timestamp}</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#e2e8f0', lineHeight: '1.4' }}>{line.text}</p>
              </div>
            ))}
            <div ref={transcriptEndRef} />
          </div>

          {/* Audio Pulsing bars */}
          <AudioWaveform isActive={isSpeaking} color="#c084fc" />

          {/* Action options or compilation trigger */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.25rem' }}>
            {callState === 'active' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Select Your Dialogue Response:</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {getDialogueOptions().map((opt, i) => (
                    <button
                      key={i}
                      className="dark-card"
                      style={{ 
                        cursor: 'pointer',
                        textAlign: 'left', 
                        padding: '0.75rem 1rem', 
                        fontSize: '0.85rem', 
                        color: '#f8fafc',
                        backgroundColor: 'rgba(255,255,255,0.02)',
                        borderColor: 'rgba(255,255,255,0.06)',
                        transition: 'border-color var(--transition-fast)'
                      }}
                      onClick={() => handleOptionSelect(opt.text, opt.scoreVal, opt.hint)}
                    >
                      <strong style={{ color: '#818cf8', marginRight: '0.5rem' }}>{i + 1}.</strong>
                      {opt.text}
                    </button>
                  ))}
                </div>
                
                {/* Simulated mic row */}
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem' }}>
                  <button 
                    className={`btn ${isMicActive ? 'btn-danger pulse-mic-btn' : 'btn-secondary'}`}
                    style={{ borderRadius: '50%', width: '40px', height: '40px', padding: 0 }}
                    onClick={() => setIsMicActive(!isMicActive)}
                  >
                    {isMicActive ? <MicOff size={16} /> : <Mic size={16} />}
                  </button>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    {isMicActive ? "Speech recognition listening... Talk naturally, then tap again to submit." : "Or tap the microphone to practice speaking verbally."}
                  </span>
                </div>
              </div>
            ) : callState === 'completed' ? (
              <div style={{ textAlign: 'center', padding: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', color: 'white' }}>Call Finished!</h3>
                <button className="btn btn-primary" onClick={handleShowResults}>
                  <Sparkles size={16} />
                  See Performance Results
                </button>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>
                Establishing AI connection...
              </div>
            )}
          </div>

        </div>

        {/* Right Side: AI Coach prompts */}
        <div className="dark-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', borderLeft: '4px solid var(--primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={18} color="#818cf8" />
            <h3 style={{ fontSize: '1rem', color: 'white' }}>AI-Coach Guidance</h3>
          </div>

          <p style={{ fontSize: '0.8rem', color: '#e2e8f0', lineHeight: '1.5', background: 'rgba(79, 70, 229, 0.1)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(79, 70, 229, 0.2)' }}>
            {coachHint}
          </p>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem', marginTop: 'auto' }}>
            <h4 style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.02em', marginBottom: '0.75rem' }}>Simulation Checkpoints</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', opacity: simStep >= 1 ? 1 : 0.5 }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: simStep >= 1 ? '#10b981' : 'transparent', border: '1.5px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>
                  {simStep >= 1 && <span style={{ color: 'white' }}>✓</span>}
                </div>
                <span style={{ color: '#e2e8f0' }}>Validate customer's objection</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', opacity: simStep >= 2 ? 1 : 0.5 }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: simStep >= 2 ? '#10b981' : 'transparent', border: '1.5px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>
                  {simStep >= 2 && <span style={{ color: 'white' }}>✓</span>}
                </div>
                <span style={{ color: '#e2e8f0' }}>Present renewal discount option</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', opacity: callState === 'completed' ? 1 : 0.5 }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: callState === 'completed' ? '#10b981' : 'transparent', border: '1.5px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>
                  {callState === 'completed' && <span style={{ color: 'white' }}>✓</span>}
                </div>
                <span style={{ color: '#e2e8f0' }}>Read compliance statement & close</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
export default LivePractice;
