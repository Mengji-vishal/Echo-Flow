import React from 'react';
import { PageContainer } from '../../components/layout/PageContainer';
import { Header } from '../../components/layout/Header';
import { PracticeScore } from '../../components/practice/PracticeScore';
import { PracticeFeedback } from '../../components/practice/PracticeFeedback';
import { RefreshCw, PlayCircle } from 'lucide-react';

interface PracticeResultsProps {
  scenarioTitle: string;
  results: {
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
  };
  onRetake: () => void;
  onPracticeOther: () => void;
}

export const PracticeResults: React.FC<PracticeResultsProps> = ({
  scenarioTitle,
  results,
  onRetake,
  onPracticeOther
}) => {
  return (
    <PageContainer>
      <Header 
        title="Practice Session Results" 
        subtitle={`Evaluation report for scenario: ${scenarioTitle}`} 
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '2rem', alignItems: 'start', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {/* Left Side: Score card */}
        <PracticeScore 
          score={results.score} 
          breakdown={results.breakdown} 
        />

        {/* Right Side: Feedback card */}
        <PracticeFeedback 
          feedback={results.feedback} 
        />
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'flex-start' }}>
        <button className="btn btn-primary" onClick={onRetake}>
          <RefreshCw size={16} />
          Retake Practice
        </button>
        <button className="btn btn-secondary" onClick={onPracticeOther}>
          <PlayCircle size={16} />
          Practice Another Scenario
        </button>
      </div>
    </PageContainer>
  );
};
export default PracticeResults;
