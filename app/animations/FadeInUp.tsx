"use client";
import { motion } from "framer-motion";
import { useRef } from "react";

interface FadeInUpProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
    duration?: number;
    yOffset?: number;
    inView?: boolean;
    animateOnMount?: boolean;
}

export default function FadeInUp({
    children,
    className,
    delay = 0,
    duration = 0.6,
    yOffset = 30,
    inView = false,
    animateOnMount = false,
}: FadeInUpProps) {
    const containerRef = useRef(null);

    return (
        <motion.div
            ref={containerRef}
            initial="initial"
            animate={animateOnMount ? "inView" : undefined}
            whileInView={!animateOnMount ? "inView" : undefined}
            viewport={
                !animateOnMount
                    ? !inView
                        ? { margin: "-100px", once: true }
                        : {
                            margin: "-150px",
                            once: true,
                        }
                    : undefined
            }
            variants={{
                initial: {
                    opacity: 0,
                    y: yOffset,
                },
                inView: {
                    opacity: 1,
                    y: 0,
                },
            }}
            transition={{
                duration: duration,
                ease: "easeOut",
                delay: delay,
            }}
            className={className || ""}
        >
            {children}
        </motion.div>
    );
}

