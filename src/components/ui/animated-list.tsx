import { ReactNode, Children, isValidElement } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface AnimatedListProps {
  children: ReactNode
  /** 每项之间的延迟（毫秒）- 可用于未来扩展 */
  delay?: number
  className?: string
  stagger?: number // 交错动画时间（秒）
}

/**
 * 列表项依次入场动画组件
 */
export function AnimatedList({
  children,
  delay: _delay = 50,
  className,
  stagger = 0.05
}: AnimatedListProps) {
  // delay 参数保留用于未来扩展
  void _delay
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: stagger,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.3,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className={cn("space-y-2", className)}
    >
      {Children.map(children, (child, index) => {
        if (isValidElement(child)) {
          return (
            <motion.div key={index} variants={itemVariants}>
              {child}
            </motion.div>
          )
        }
        return child
      })}
    </motion.div>
  )
}

interface AnimatedListItemProps {
  children: ReactNode
  delay?: number
  className?: string
}

/**
 * 单个动画列表项
 */
export function AnimatedListItem({ 
  children, 
  delay = 0,
  className 
}: AnimatedListItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        delay: delay / 1000,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export default AnimatedList

