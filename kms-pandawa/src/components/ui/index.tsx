import React from 'react';
import { cn } from '../../lib/utils';
import { Info, CheckCircle, AlertTriangle, AlertCircle, X } from 'lucide-react';

export function Button({ 
  children, 
  className, 
  variant = 'primary', 
  size = 'md', 
  disabled, 
  loading,
  leftIcon,
  rightIcon,
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}) {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none';
  const variants = {
    primary: 'bg-primary text-text-inverse hover:bg-primary-hover active:scale-[0.98] shadow-sm',
    secondary: 'bg-surface-elevated text-text-primary border border-border hover:bg-surface-hover active:scale-[0.98]',
    ghost: 'bg-transparent text-text-secondary hover:bg-surface-hover hover:text-text-primary active:scale-[0.98]',
    danger: 'bg-error text-text-inverse hover:bg-red-700 active:scale-[0.98] shadow-sm',
    success: 'bg-success text-text-inverse hover:bg-emerald-700 active:scale-[0.98] shadow-sm',
  };
  const sizes = {
    sm: 'min-h-[32px] px-3 py-1.5 text-xs',
    md: 'min-h-[44px] px-4 py-2.5 text-sm',
    lg: 'min-h-[48px] px-6 py-3 text-base',
  };

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : null}
      {!loading && leftIcon && <span className="flex items-center" aria-hidden="true">{leftIcon}</span>}
      {children}
      {!loading && rightIcon && <span className="flex items-center ml-1" aria-hidden="true">{rightIcon}</span>}
    </button>
  );
}

export function Input({ 
  label, 
  error, 
  helperText, 
  className, 
  required,
  leftIcon,
  ...props 
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  leftIcon?: React.ReactNode;
}) {
  const id = props.id || props.name;
  return (
    <div className="w-full">
      {label && (
        <label className={cn('label font-medium-readable', required && 'after:content-["*"] after:text-error after:ml-0.5')} htmlFor={id}>
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" aria-hidden="true">
            {leftIcon}
          </div>
        )}
        <input
          id={id}
          className={cn('input min-h-[44px] text-sm-readable', error && 'border-error focus:border-error focus:ring-error/20', className, leftIcon && 'pl-10')}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
          {...props}
        />
      </div>
      {error && <p id={`${id}-error`} className="mt-1 text-sm-readable text-error" role="alert">{error}</p>}
      {helperText && !error && <p id={`${id}-helper`} className="mt-1 text-sm-readable text-medium-contrast">{helperText}</p>}
    </div>
  );
}

export function Textarea({ 
  label, 
  error, 
  helperText, 
  className, 
  required,
  ...props 
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}) {
  const id = props.id || props.name;
  return (
    <div className="w-full">
      {label && (
        <label className={cn('label font-medium-readable', required && 'after:content-["*"] after:text-error after:ml-0.5')} htmlFor={id}>
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={cn('input min-h-[100px] resize-y text-sm-readable', error && 'border-error focus:border-error focus:ring-error/20', className)}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
        {...props}
      />
      {error && <p id={`${id}-error`} className="mt-1 text-sm-readable text-error" role="alert">{error}</p>}
      {helperText && !error && <p id={`${id}-helper`} className="mt-1 text-sm-readable text-medium-contrast">{helperText}</p>}
    </div>
  );
}

export function Select({ 
  label, 
  error, 
  helperText, 
  options, 
  placeholder,
  className, 
  required,
  ...props 
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
  helperText?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
}) {
  const id = props.id || props.name;
  return (
    <div className="w-full">
      {label && (
        <label className={cn('label font-medium-readable', required && 'after:content-["*"] after:text-error after:ml-0.5')} htmlFor={id}>
          {label}
        </label>
      )}
      <select
        id={id}
        className={cn('input min-h-[44px] text-sm-readable', error && 'border-error focus:border-error focus:ring-error/20', className)}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
        {...props}
      >
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p id={`${id}-error`} className="mt-1 text-sm-readable text-error" role="alert">{error}</p>}
      {helperText && !error && <p id={`${id}-helper`} className="mt-1 text-sm-readable text-medium-contrast">{helperText}</p>}
    </div>
  );
}

export function Card({ children, className, hover, padding = 'p-6', ...props }: React.HTMLAttributes<HTMLDivElement> & {
  hover?: boolean;
  padding?: string;
}) {
  return (
    <div 
      className={cn('card text-high-contrast', hover && 'hover:shadow-md cursor-pointer', padding, className)} 
      {...props}
    >
      {children}
    </div>
  );
}

export function Badge({ children, variant = 'neutral', className, ...props }: React.HTMLAttributes<HTMLSpanElement> & {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'primary';
}) {
  const variants = {
    success: 'badge-success font-medium-readable',
    warning: 'badge-warning font-medium-readable',
    error: 'badge-error font-medium-readable',
    info: 'badge-info font-medium-readable',
    neutral: 'badge-neutral font-medium-readable',
    primary: 'bg-primary-light text-primary-dark font-medium-readable',
  };
  return <span className={cn(variants[variant], className)} {...props}>{children}</span>;
}

export function Avatar({ src, alt, name, size = 'md', className }: {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  if (src) {
    return <img src={src} alt={alt || name || 'Avatar'} className={cn('rounded-full object-cover', sizes[size], className)} />;
  }

  const initials = name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';
  const bgColors = ['bg-primary-600', 'bg-emerald-600', 'bg-teal-600', 'bg-green-600', 'bg-primary-700', 'bg-emerald-700', 'bg-teal-700', 'bg-green-700'];
  const colorIndex = name ? name.charCodeAt(0) % bgColors.length : 0;

  return (
    <div 
      className={cn('rounded-full flex items-center justify-center font-medium text-text-inverse', sizes[size], bgColors[colorIndex], className)}
      aria-label={name || 'User avatar'}
      role="img"
    >
      {initials}
    </div>
  );
}

export function Modal({ isOpen, onClose, title, children, className, size = 'md' }: {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}) {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-in" role="dialog" aria-modal="true" aria-labelledby={title ? 'modal-title' : undefined}>
      <div className={cn('bg-surface rounded-2xl shadow-2xl w-full overflow-hidden', sizes[size], className)}>
        {(title || onClose !== undefined) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            {title && <h2 id="modal-title" className="text-lg font-semibold text-text-primary">{title}</h2>}
            {onClose && (
              <button 
                onClick={onClose} 
                className="btn-ghost p-2 rounded-lg w-10 h-10 flex items-center justify-center" 
                aria-label="Tutup modal"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            )}
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

interface TabProps {
  value: string;
  children: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export function Tabs({ defaultValue, onChange, children, className }: {
  defaultValue: string;
  onChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}) {
  const [activeTab, setActiveTab] = React.useState(defaultValue);
  
  return (
    <div className={cn('border-b border-border', className)}>
      <nav className="flex gap-1 overflow-x-auto scrollbar-thin pb-px" role="tablist">
        {React.Children.map(children, child => {
          if (!React.isValidElement<TabProps>(child)) return null;
          const value = child.props.value;
          return React.cloneElement<TabProps>(child, {
            isActive: activeTab === value,
            onClick: () => {
              setActiveTab(value);
              onChange?.(value);
            },
          });
        })}
      </nav>
      <div className="mt-4">
        {React.Children.map(children, child => {
          if (!React.isValidElement<TabProps>(child)) return null;
          if (child.props.value === activeTab) return child.props.children;
          return null;
        })}
      </div>
    </div>
  );
}

export function Tab({ value, children, isActive, onClick, className, disabled }: {
  value: string;
  children: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <button
      role="tab"
      aria-selected={isActive}
      aria-controls={`${value}-panel`}
      id={`${value}-tab`}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'px-4 py-3 text-sm-readable font-medium-readable rounded-t-lg transition-colors whitespace-nowrap min-h-[44px] cursor-pointer',
        isActive 
          ? 'text-primary border-b-2 border-primary bg-primary/5 font-semibold-readable' 
          : 'text-medium-contrast hover:text-high-contrast hover:bg-surface-elevated font-medium-readable',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {children}
    </button>
  );
}

export function Dropdown({ trigger, items, align = 'right', className }: {
  trigger: React.ReactNode;
  items: { label: string; onClick: () => void; icon?: React.ReactNode; danger?: boolean; disabled?: boolean }[];
  align?: 'left' | 'right';
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className={cn('relative inline-block', className)}>
      <div onClick={() => setOpen(!open)} className="cursor-pointer">
        {trigger}
      </div>
      {open && (
        <div 
          className={cn(
            'absolute z-50 mt-1.5 min-w-[180px] bg-surface border border-border rounded-xl shadow-lg animate-in',
            align === 'right' ? 'right-0' : 'left-0'
          )}
          role="menu"
        >
          {items.map((item, i) => (
            <button
              key={i}
              onClick={() => { item.onClick(); setOpen(false); }}
              disabled={item.disabled}
              role="menuitem"
              className={cn(
                'w-full px-4 py-3 text-sm text-left flex items-center gap-2.5 transition-colors min-h-[44px]',
                i === 0 ? 'rounded-t-xl' : '',
                i === items.length - 1 ? 'rounded-b-xl' : '',
                item.danger ? 'text-error hover:bg-error/10' : 'text-text-primary hover:bg-surface-elevated',
                item.disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              {item.icon && <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center" aria-hidden="true">{item.icon}</span>}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function Skeleton({ className, variant = 'text', width, height, count = 1 }: {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  count?: number;
}) {
  const variants = {
    text: 'h-4 w-full max-w-[200px]',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'animate-pulse bg-surface-elevated',
            variants[variant],
            variant === 'text' && 'rounded',
            width && `w-[${width}]`,
            height && `h-[${height}]`,
            variant === 'circular' && width && `w-[${width}]`,
            variant === 'circular' && height && `h-[${height}]`
          )}
        />
      ))}
    </div>
  );
}

export function EmptyState({ icon, title, description, action, className }: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center py-12 px-4', className)}>
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-medium text-text-primary">{title}</h3>
      {description && <p className="mt-1 text-sm text-text-muted max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Alert({ children, className, variant = 'info' }: { 
  children: React.ReactNode; 
  className?: string; 
  variant?: 'info' | 'success' | 'warning' | 'error';
}) {
  const variants = {
    info: 'bg-info-light/30 border-info/30 text-info font-medium-readable',
    success: 'bg-success-light/30 border-success/30 text-success font-medium-readable',
    warning: 'bg-warning-light/30 border-warning/30 text-warning font-medium-readable',
    error: 'bg-error-light/30 border-error/30 text-error font-medium-readable',
  };
  const icons = {
    info: <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />,
    success: <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />,
    warning: <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />,
    error: <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />,
  };
  return (
    <div className={cn('flex items-start gap-3 p-4 rounded-lg border', variants[variant], className)} role="alert">
      <span aria-hidden="true">{icons[variant]}</span>
      <div className="text-sm-readable">{children}</div>
    </div>
  );
}

export function LoadingOverlay({ isLoading, children, message }: {
  isLoading: boolean;
  children: React.ReactNode;
  message?: string;
}) {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-surface/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl">
          <div className="flex flex-col items-center gap-3 p-6 bg-surface rounded-xl shadow-lg">
            <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            {message && <p className="text-sm text-text-secondary">{message}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

export function Table({ children, className }: { children: React.ReactNode; className?: string }) {
  return <table className={cn('w-full text-sm', className)}>{children}</table>;
}

export function TableHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <thead className={cn('[&_tr]:border-b', className)}>{children}</thead>;
}

export function TableBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <tbody className={cn('[&_tr:last-child]:border-0', className)}>{children}</tbody>;
}

export function TableRow({ children, className, ...props }: React.HTMLAttributes<HTMLTableRowElement> & { children: React.ReactNode; className?: string }) {
  return <tr className={cn('border-b border-border/50 hover:bg-primary/5 transition-colors', className)} {...props}>{children}</tr>;
}

export function TableHead({ children, className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement> & { children: React.ReactNode; className?: string }) {
  return <th className={cn('px-4 py-3 text-left font-semibold-readable text-high-contrast bg-primary-50 border-b border-border', className)} {...props}>{children}</th>;
}

export function TableCell({ children, className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement> & { children: React.ReactNode; className?: string }) {
  return <td className={cn('px-4 py-3 text-sm-readable text-high-contrast border-b border-border/50', className)} {...props}>{children}</td>;
}