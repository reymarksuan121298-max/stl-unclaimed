import { motion } from 'framer-motion'

const pageVariants = {
    initial: {
        opacity: 0,
        y: 20
    },
    animate: {
        opacity: 1,
        y: 0
    },
    exit: {
        opacity: 0,
        y: -20
    }
}

const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.4
}

export function PageTransition({ children }) {
    return (
        <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={pageTransition}
        >
            {children}
        </motion.div>
    )
}

// Card animation for dashboard cards, modals, etc.
export function FadeIn({ children, delay = 0 }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.3 }}
        >
            {children}
        </motion.div>
    )
}

// Stagger animation for lists
export function StaggerContainer({ children }) {
    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={{
                visible: {
                    transition: {
                        staggerChildren: 0.05
                    }
                }
            }}
        >
            {children}
        </motion.div>
    )
}

export function StaggerItem({ children }) {
    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
            }}
        >
            {children}
        </motion.div>
    )
}
