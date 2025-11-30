'use client';

import { HTMLAttributes, forwardRef, ReactNode } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'gradient' | 'bordered' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  header?: ReactNode;
  footer?: ReactNode;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className = '',
      variant = 'default',
      padding = 'md',
      hover = false,
      header,
      footer,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'rounded-xl transition-all duration-300';

    const variantStyles = {
      default:
        'bg-white border border-gray-200 shadow-sm',
      gradient:
        'bg-gradient-to-br from-white via-primary-50/30 to-secondary-50/30 border border-primary-100/50 shadow-md',
      bordered:
        'bg-white border-2 border-primary-200 shadow-sm',
      elevated:
        'bg-white shadow-lg shadow-gray-200/50',
    };

    const paddingStyles = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };

    const hoverStyles = hover
      ? 'hover:shadow-xl hover:-translate-y-1 cursor-pointer'
      : '';

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${hoverStyles} ${className}`}
        {...props}
      >
        {header && (
          <div className={`border-b border-gray-200 ${paddingStyles[padding]} pb-4 mb-4`}>
            {header}
          </div>
        )}
        <div className={header || footer ? '' : paddingStyles[padding]}>
          {children}
        </div>
        {footer && (
          <div className={`border-t border-gray-200 ${paddingStyles[padding]} pt-4 mt-4`}>
            {footer}
          </div>
        )}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
