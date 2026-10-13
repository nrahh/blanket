import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Icon } from "@iconify/react";

const faqs = [
    {
        question: "Is Blanket.ink good?",
        answer: "We cannot achieve complete perfectionism, but we thrive in attempting to achieve the closest contender to the barrier of human ability and perfectionism.",
    },
    {
        question: "Does Blanket.ink specialize in all types of UI?",
        answer: "No, we do not specialize in all types of user interfaces. We mainly create modern user interfaces but sometimes experiment with other styles.",
    },
    {
        question: "Is there easy-communication while working with Blanket.ink?",
        answer: "We are fluent in English and for other languages we opt for tools such as Google Translate. But quality communication isn't guaranteed when using such tools due to uncommon mistranslations occuring.",
    },
];

export default function FAQ() {
    const [opened, setOpened] = useState<number | null>(null);

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-10">
            <div className="w-full max-w-2xl flex flex-col">
                {faqs.map((faq, index) => (
                    <div
                        key={faq.question}
                        className="w-full border-b border-white/10"
                    >
                        <button
                            onClick={() => setOpened(opened === index ? null : index)}
                            className="w-full flex items-center justify-between gap-4 py-5 text-left cursor-pointer"
                        >
                            <h2 className="text-white text-lg font-medium">
                                {faq.question}
                            </h2>

                            <motion.div
                                animate={{ rotate: opened === index ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                                className="shrink-0"
                            >
                                <Icon
                                    icon="lucide:chevron-down"
                                    width={20}
                                    height={20}
                                    color="white"
                                />
                            </motion.div>
                        </button>

                        <AnimatePresence initial={false}>
                            {opened === index && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.25 }}
                                    className="overflow-hidden"
                                >
                                    <p className="text-white/50 text-sm leading-relaxed pb-5 max-w-150">
                                        {faq.answer}
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>
        </div>
    );
}