import React, { useState } from "react";

const FAQPage = () => {
    return (
        <div>
            <Faq />
        </div>
    );
};

const Faq = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [hoveredId, setHoveredId] = useState(null);

    const toggleTab = (tab) => {
        setActiveTab((prev) => (prev === tab ? 0 : tab));
    };

    return (
        <div className="py-16 px-4">
            <div className="flex items-center justify-center gap-3 mb-12">
                <span className="text-5xl text-[#a67d6d]">✦</span>
                <h2 className="text-4xl font-extrabold text-gray-900">
                    FAQ
                </h2>
                <span className="text-5xl text-[#a67d6d]">✦</span>
            </div>

            <div className="mx-auto max-w-4xl space-y-4">
                {faqData.map((item, index) => (
                    <div
                        key={index}
                        className="relative"
                        onMouseEnter={() => setHoveredId(item.id)}
                        onMouseLeave={() => setHoveredId(null)}
                    >
                        <div
                            className={`
                                rounded-xl border overflow-hidden
                                ${activeTab === item.id ? 'bg-[#d8c4b8] shadow-lg' : 'bg-white'}
                                ${hoveredId === item.id ? 'transform -translate-y-1 shadow-xl' : 'shadow-sm'}
                                transition-all duration-300 ease-in-out
                            `}
                        >
                            <button
                                className={`
                                    flex items-center justify-between w-full px-6 py-4
                                    focus:outline-none transition-all duration-300
                                    ${activeTab === item.id ? 'text-[#5a4336]' : 'text-gray-900'}
                                `}
                                onClick={() => toggleTab(item.id)}
                            >
                                <span className="text-lg font-medium">
                                    {item.question}
                                </span>
                                <div
                                    className={`
                                        flex items-center justify-center h-8 w-8 rounded-full
                                        ${activeTab === item.id ? 'bg-[#a67d6d]' : 'bg-[#d8c4b8]'}
                                        transition-all duration-300
                                    `}
                                >
                                    <svg
                                        className={`
                                            h-4 w-4 transform transition-transform duration-300
                                            ${activeTab === item.id ? 'rotate-180 text-white' : 'rotate-0 text-[#5a4336]'}
                                        `}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 9l-7 7-7-7"
                                        />
                                    </svg>
                                </div>
                            </button>
                            <div
                                className={`
                                    grid transition-all duration-300
                                    ${activeTab === item.id ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}
                                `}
                            >
                                <div className="overflow-hidden">
                                    <div className="px-6 pb-4 text-[#5a4336]">
                                        {item.answer}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const faqData = [
    {
        id: 1,
        question: "What is your return policy?",
        answer:
            "If you're not satisfied with your purchase, we accept returns within 30 days of delivery. To initiate a return, email us at support@myecommercestore.com with your order number and a brief explanation.",
    },
    {
        id: 2,
        question: "How do I contact customer support?",
        answer: "You can reach us at support@tamkeenshop.com. We're here to help!",
    },
    {
        id: 3,
        question: "Can I change or cancel my order?",
        answer:
            "Once an order is placed, we are unable to make changes or cancellations. You can return items for a refund within 30 days of delivery.",
    },
    {
        id: 4,
        question: "Do you offer international shipping?",
        answer: "Currently, we only offer shipping within Pakistan.",
    },
    {
        id: 5,
        question: "What payment methods do you accept?",
        answer: "We accept a cash-on-delivery payment system.",
    },
];

export default FAQPage;