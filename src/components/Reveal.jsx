import React from 'react'
import { motion } from 'framer-motion'

const defaultVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
}

export default function Reveal({
  children,
  delay = 0,
  y = 30,
  once = true,
  as = 'div',
  className = '',
  style,
  ...rest
}) {
  const Tag = motion[as] || motion.div

  return (
    <Tag
      className={className}
      style={style}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: 0.2 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      variants={{
        hidden: { opacity: 0, y },
        visible: { opacity: 1, y: 0 }
      }}
      {...rest}
    >
      {children}
    </Tag>
  )
}
