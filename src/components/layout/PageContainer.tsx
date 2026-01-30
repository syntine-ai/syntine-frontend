import { motion, Variants } from "framer-motion";
import { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
}

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: "easeOut",
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" },
  },
};

export function PageContainer({ children, title, subtitle, actions }: PageContainerProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-5 lg:p-8 w-full"
    >
      {(title || actions) && (
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            {title && (
              <h1 className="text-2xl lg:text-4xl font-semibold text-foreground tracking-tight">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-muted-foreground mt-1.5 text-sm">{subtitle}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-3">{actions}</div>}
        </motion.div>
      )}
      <motion.div variants={itemVariants}>{children}</motion.div>
    </motion.div>
  );
}

export { itemVariants as pageItemVariants };
