import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { type ComponentType, type SVGProps } from 'react';

// Use React component type for Phosphor icons
type IconComponent = ComponentType<
  SVGProps<SVGSVGElement> & {
    size?: number | string;
    weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';
  }
>;

interface EmptyStateProps {
  icon: IconComponent;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  iconColor?: string;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  iconColor = 'text-muted-foreground',
  className,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={cn('py-16 text-center', className)}
      role="status"
      aria-label={title}
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, duration: 0.3, ease: 'easeOut' }}
      >
        <Icon
          className={cn('mx-auto mb-4', iconColor)}
          size={64}
          weight="duotone"
          aria-hidden="true"
        />
      </motion.div>
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-2 text-xl font-medium"
      >
        {title}
      </motion.h3>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-muted-foreground mx-auto max-w-md"
      >
        {description}
      </motion.p>
      {action && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onClick={action.onClick}
          className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring mt-6 inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
        >
          {action.label}
        </motion.button>
      )}
    </motion.div>
  );
}

// Smaller inline empty state for search results, etc.
interface InlineEmptyStateProps {
  icon: IconComponent;
  title: string;
  description?: string;
  className?: string;
}

export function InlineEmptyState({
  icon: Icon,
  title,
  description,
  className,
}: InlineEmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn('py-12 text-center', className)}
      role="status"
    >
      <Icon
        className="text-muted-foreground mx-auto mb-4"
        size={48}
        weight="duotone"
        aria-hidden="true"
      />
      <h3 className="mb-2 text-lg font-medium">{title}</h3>
      {description && <p className="text-muted-foreground text-sm">{description}</p>}
    </motion.div>
  );
}
