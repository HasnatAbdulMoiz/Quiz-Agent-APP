import google.generativeai as genai
import json
import os
from typing import List, Dict, Any, Optional
from backend.schemas import QuestionCreate, QuestionType, AIGenerationRequest
from backend.models import Question, Quiz
from sqlalchemy.orm import Session
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class QuizGenerator:
    def __init__(self):
        """Initialize the Gemini AI quiz generator."""
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable is required")
        
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-pro')
        
    def generate_quiz_content(self, request: AIGenerationRequest) -> Dict[str, Any]:
        """Generate quiz content using Gemini AI."""
        try:
            # Create the prompt for quiz generation
            prompt = self._create_quiz_prompt(request)
            
            # Generate content using Gemini
            response = self.model.generate_content(prompt)
            
            # Parse the response
            quiz_data = self._parse_ai_response(response.text, request)
            
            return quiz_data
            
        except Exception as e:
            logger.error(f"Error generating quiz content: {str(e)}")
            raise Exception(f"Failed to generate quiz content: {str(e)}")
    
    def _create_quiz_prompt(self, request: AIGenerationRequest) -> str:
        """Create a detailed prompt for quiz generation."""
        question_types_str = ", ".join([qt.value for qt in request.question_types])
        
        prompt = f"""
        You are an expert educational content creator. Generate a comprehensive quiz with the following specifications:

        Subject: {request.subject}
        Grade Level: {request.grade_level}
        Topic: {request.topic}
        Number of Questions: {request.number_of_questions}
        Difficulty Level: {request.difficulty_level}
        Question Types: {question_types_str}

        {f"Custom Instructions: {request.custom_prompt}" if request.custom_prompt else ""}

        Please generate the quiz in the following JSON format:
        {{
            "title": "Quiz title here",
            "description": "Brief description of the quiz",
            "questions": [
                {{
                    "question_text": "The question text here",
                    "question_type": "multiple_choice|true_false|short_answer|essay",
                    "options": ["Option A", "Option B", "Option C", "Option D"] (only for multiple choice),
                    "correct_answer": "The correct answer",
                    "explanation": "Explanation of why this is correct",
                    "points": 1,
                    "difficulty_level": "easy|medium|hard"
                }}
            ]
        }}

        Guidelines:
        1. Make questions age-appropriate for {request.grade_level}
        2. Ensure questions are clear and unambiguous
        3. For multiple choice, provide 4 options with only one correct answer
        4. For true/false, make statements clear and testable
        5. For short answer, provide specific expected answers
        6. For essay questions, provide clear evaluation criteria
        7. Include explanations that help students learn
        8. Vary difficulty levels appropriately
        9. Ensure questions cover the topic comprehensively

        Generate the quiz now:
        """
        
        return prompt
    
    def _parse_ai_response(self, response_text: str, request: AIGenerationRequest) -> Dict[str, Any]:
        """Parse the AI response and extract quiz data."""
        try:
            # Clean the response text
            cleaned_text = self._clean_response_text(response_text)
            
            # Try to parse as JSON
            try:
                quiz_data = json.loads(cleaned_text)
            except json.JSONDecodeError:
                # If direct JSON parsing fails, try to extract JSON from the text
                quiz_data = self._extract_json_from_text(cleaned_text)
            
            # Validate the structure
            self._validate_quiz_data(quiz_data)
            
            return quiz_data
            
        except Exception as e:
            logger.error(f"Error parsing AI response: {str(e)}")
            raise Exception(f"Failed to parse AI response: {str(e)}")
    
    def _clean_response_text(self, text: str) -> str:
        """Clean the response text to extract valid JSON."""
        # Remove markdown code blocks
        text = text.replace("```json", "").replace("```", "")
        
        # Find the first { and last }
        start_idx = text.find("{")
        end_idx = text.rfind("}")
        
        if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
            return text[start_idx:end_idx + 1]
        
        return text.strip()
    
    def _extract_json_from_text(self, text: str) -> Dict[str, Any]:
        """Extract JSON from text that might contain other content."""
        lines = text.split('\n')
        json_lines = []
        in_json = False
        
        for line in lines:
            if line.strip().startswith('{'):
                in_json = True
            if in_json:
                json_lines.append(line)
            if line.strip().endswith('}') and in_json:
                break
        
        json_text = '\n'.join(json_lines)
        return json.loads(json_text)
    
    def _validate_quiz_data(self, data: Dict[str, Any]) -> None:
        """Validate the structure of quiz data."""
        required_fields = ["title", "description", "questions"]
        
        for field in required_fields:
            if field not in data:
                raise ValueError(f"Missing required field: {field}")
        
        if not isinstance(data["questions"], list):
            raise ValueError("Questions must be a list")
        
        if len(data["questions"]) == 0:
            raise ValueError("Quiz must have at least one question")
        
        # Validate each question
        for i, question in enumerate(data["questions"]):
            self._validate_question(question, i)
    
    def _validate_question(self, question: Dict[str, Any], index: int) -> None:
        """Validate a single question."""
        required_fields = ["question_text", "question_type", "correct_answer"]
        
        for field in required_fields:
            if field not in question:
                raise ValueError(f"Question {index + 1} missing required field: {field}")
        
        # Validate question type
        valid_types = ["multiple_choice", "true_false", "short_answer", "essay"]
        if question["question_type"] not in valid_types:
            raise ValueError(f"Question {index + 1} has invalid question type")
        
        # Validate multiple choice questions
        if question["question_type"] == "multiple_choice":
            if "options" not in question or not isinstance(question["options"], list):
                raise ValueError(f"Question {index + 1} (multiple choice) must have options")
            if len(question["options"]) < 2:
                raise ValueError(f"Question {index + 1} (multiple choice) must have at least 2 options")
    
    def create_questions_in_db(self, quiz_data: Dict[str, Any], quiz_id: int, db: Session) -> List[Question]:
        """Create questions in the database."""
        questions = []
        
        for i, question_data in enumerate(quiz_data["questions"]):
            question = Question(
                question_text=question_data["question_text"],
                question_type=question_data["question_type"],
                options=question_data.get("options"),
                correct_answer=question_data["correct_answer"],
                explanation=question_data.get("explanation"),
                points=question_data.get("points", 1),
                difficulty_level=question_data.get("difficulty_level", "medium"),
                order_index=i,
                quiz_id=quiz_id
            )
            
            db.add(question)
            questions.append(question)
        
        db.commit()
        return questions
    
    def generate_table_of_contents(self, subject: str, grade_level: str) -> List[Dict[str, Any]]:
        """Generate a table of contents for a subject."""
        try:
            prompt = f"""
            Generate a comprehensive table of contents for {subject} at {grade_level} level.
            
            Return the response in the following JSON format:
            {{
                "chapters": [
                    {{
                        "title": "Chapter Title",
                        "description": "Chapter description",
                        "order_index": 1,
                        "topics": [
                            {{
                                "title": "Topic Title",
                                "description": "Topic description",
                                "order_index": 1,
                                "subtopics": [
                                    {{
                                        "title": "Subtopic Title",
                                        "description": "Subtopic description",
                                        "order_index": 1
                                    }}
                                ]
                            }}
                        ]
                    }}
                ]
            }}
            
            Make it comprehensive and educationally appropriate for {grade_level}.
            """
            
            response = self.model.generate_content(prompt)
            cleaned_text = self._clean_response_text(response.text)
            
            try:
                toc_data = json.loads(cleaned_text)
            except json.JSONDecodeError:
                toc_data = self._extract_json_from_text(cleaned_text)
            
            return toc_data.get("chapters", [])
            
        except Exception as e:
            logger.error(f"Error generating table of contents: {str(e)}")
            return []
    
    def analyze_performance(self, quiz_results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze quiz performance and provide insights."""
        try:
            prompt = f"""
            Analyze the following quiz performance data and provide educational insights:
            
            {json.dumps(quiz_results, indent=2)}
            
            Provide analysis in the following JSON format:
            {{
                "overall_performance": {{
                    "average_score": 0.0,
                    "completion_rate": 0.0,
                    "common_weaknesses": ["weakness1", "weakness2"],
                    "strengths": ["strength1", "strength2"]
                }},
                "recommendations": [
                    "recommendation1",
                    "recommendation2"
                ],
                "difficulty_analysis": {{
                    "too_easy": ["question1", "question2"],
                    "too_hard": ["question3", "question4"],
                    "appropriate": ["question5", "question6"]
                }}
            }}
            """
            
            response = self.model.generate_content(prompt)
            cleaned_text = self._clean_response_text(response.text)
            
            try:
                analysis = json.loads(cleaned_text)
            except json.JSONDecodeError:
                analysis = self._extract_json_from_text(cleaned_text)
            
            return analysis
            
        except Exception as e:
            logger.error(f"Error analyzing performance: {str(e)}")
            return {
                "overall_performance": {
                    "average_score": 0.0,
                    "completion_rate": 0.0,
                    "common_weaknesses": [],
                    "strengths": []
                },
                "recommendations": [],
                "difficulty_analysis": {
                    "too_easy": [],
                    "too_hard": [],
                    "appropriate": []
                }
            }
