"use client";

import { useState } from "react";
import useCurrentUser from "@/lib/hook/useCurrentUser";

export interface ReviewFormData {
    name: string;
    rating: number;
    text: string;
    userId?: string;
}

interface ReviewFormProps {
    onSubmit: (data: ReviewFormData) => void;
    isSubmitting: boolean;
}

export default function ReviewForm({ onSubmit, isSubmitting }: ReviewFormProps) {
    const [name, setName] = useState("");
    const [rating, setRating] = useState(0);
    const [text, setText] = useState("");
    const [hoverRating, setHoverRating] = useState(0);

    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const user = useCurrentUser();

    const validate = () => {
        const newErrors: { [key: string]: string } = {};
        if (!user && !name.trim()) newErrors.name = "Name is required";
        if (rating === 0) newErrors.rating = "Please select a star rating";
        if (!text.trim()) newErrors.text = "Review text is required";
        else if (text.length > 1000) newErrors.text = "Review cannot exceed 1000 characters";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        onSubmit({
            name: user ? user.name : name,
            rating,
            text,
            userId: user?.id,
        });

        if (!user) setName("");
        setRating(0);
        setText("");
    };

    return (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-10">
            <h3 className="text-lg font-bold mb-4">Write a Review</h3>

            {/* Name Field */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                {user ? (
                    <div className="flex items-center gap-2">
                        <span className="text-gray-900 font-semibold">{user.name}</span>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Logged In</span>
                    </div>
                ) : (
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={`w-full p-2 border rounded-md ${errors.name ? "border-red-500" : "border-gray-300"}`}
                        placeholder="Your Name"
                    />
                )}
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Star Rating */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                <div className="flex gap-1" onMouseLeave={() => setHoverRating(0)}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            className="text-2xl focus:outline-none transition-transform hover:scale-110"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                        >
                            <span className={star <= (hoverRating || rating) ? "text-yellow-400" : "text-gray-300"}>
                                ★
                            </span>
                        </button>
                    ))}
                </div>
                {errors.rating && <p className="text-red-500 text-xs mt-1">{errors.rating}</p>}
            </div>

            {/* Review Text */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Review <span className="text-gray-400 font-normal">({text.length}/1000)</span>
                </label>
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={4}
                    className={`w-full p-2 border rounded-md ${errors.text ? "border-red-500" : "border-gray-300"}`}
                    placeholder="Share your thoughts..."
                    maxLength={1000}
                />
                {errors.text && <p className="text-red-500 text-xs mt-1">{errors.text}</p>}
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={isSubmitting}
                className="bg-black text-white px-6 py-2 rounded-md font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                {isSubmitting ? "Submitting..." : "Submit Review"}
            </button>
        </form>
    );
}