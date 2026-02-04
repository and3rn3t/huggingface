import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { Children, isValidElement, ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  /** Unique key for the transition (e.g., activeTab) */
  transitionKey: string;
  className?: string;
}

const pageVariants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  animate: {
    opacity: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    y: -10,
  },
};

const pageTransition = {
  type: 'tween' as const,
  ease: 'easeOut' as const,
  duration: 0.2,
};

export function PageTransition({ children, transitionKey, className }: PageTransitionProps) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={transitionKey}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        transition={pageTransition}
        className={cn(className)}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// Staggered list animation for grids of cards
interface StaggeredListProps {
  children: ReactNode[];
  className?: string;
  /** Delay between each item animation in seconds */
  staggerDelay?: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 24,
    },
  },
};

export function StaggeredList({ children, className }: StaggeredListProps) {
  const childArray = Children.toArray(children);
  
  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {childArray.map((child, index) => {
        // Use the child's key if it's a valid element, otherwise use index as fallback
        const key = isValidElement(child) && child.key !== null 
          ? child.key 
          : `staggered-item-${index}`;
        
        return (
          <motion.div key={key} variants={itemVariants}>
            {child}
          </motion.div>
        );
      })}
    </motion.div>
  );
}

// Fade in animation wrapper
interface FadeInProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function FadeIn({ children, delay = 0, className }: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 0.4 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
