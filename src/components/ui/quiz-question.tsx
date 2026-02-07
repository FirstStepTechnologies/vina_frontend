"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { QuizQuestion as IQuizQuestion } from "@/lib/api/types";

interface QuizQuestionProps {
    question: IQuizQuestion;
    onAnswer: (selected: string, isCorrect: boolean) => void;
    allowRetry?: boolean;
}

export function QuizQuestion({ question, onAnswer, allowRetry = false }: QuizQuestionProps) {
    const [selected, setSelected] = useState<string | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);

    const handleSelect = (option: string) => {
        if (showFeedback && !allowRetry) return;

        setSelected(option);
        const isCorrect = option === question.correctAnswer;
        setShowFeedback(true);

        onAnswer(option, isCorrect);
    };

    return (
        <div className="w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-6 leading-relaxed">
                {question.questionText}
            </h3>

            <div className="space-y-3">
                {question.options.map((option) => {
                    const isSelected = selected === option;
                    const isCorrectAnswer = option === question.correctAnswer;

                    let stateStyles = "border-gray-200 text-gray-700 hover:border-teal-300 hover:bg-gray-50";

                    if (showFeedback) {
                        if (isCorrectAnswer) {
                            stateStyles = "border-green-500 bg-green-50 text-green-900";
                        } else if (isSelected && !isCorrectAnswer) {
                            stateStyles = "border-red-500 bg-red-50 text-red-900";
                        } else {
                            stateStyles = "border-gray-100 text-gray-400 opacity-60";
                        }
                    } else if (isSelected) {
                        stateStyles = "border-teal-600 bg-teal-50 text-teal-900";
                    }

                    return (
                        <button
                            key={option}
                            onClick={() => handleSelect(option)}
                            disabled={showFeedback && !allowRetry}
                            className={cn(
                                "w-full text-left p-4 rounded-xl border-2 transition-all duration-300 text-lg font-medium",
                                stateStyles
                            )}
                        >
                            {option}
                        </button>
                    );
                })}
            </div>

            {showFeedback && (
                <div className={cn(
                    "mt-6 p-4 rounded-xl border animate-fade-in",
                    selected === question.correctAnswer
                        ? "bg-green-100 border-green-200 text-green-800"
                        : "bg-red-50 border-red-100 text-red-800"
                )}>
                    <p className="font-bold mb-1">
                        {selected === question.correctAnswer ? "✅ Correct!" : "❌ Not quite"}
                    </p>
                    <p className="text-sm opacity-90 leading-relaxed">
                        {question.explanation}
                    </p>
                </div>
            )}
        </div>
    );
}
