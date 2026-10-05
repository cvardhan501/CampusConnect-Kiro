import React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const errorId = textareaId && error ? `${textareaId}-error` : undefined;
    const helperId = textareaId && helperText && !error ? `${textareaId}-helper` : undefined;
    const describedBy = errorId || helperId || props['aria-describedby'];

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={textareaId} className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            {label}
            {props.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`w-full rounded-xl border bg-slate-50/70 py-2.5 px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#2563eb] focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-slate-100 transition-all ${
            error ? 'border-red-500 focus:ring-red-100' : 'border-slate-200/90'
          } ${className}`}
          rows={props.rows || 4}
          {...props}
        />
        {error && (
          <p id={errorId} role="alert" className="text-xs text-red-600 font-medium">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="text-xs text-slate-500 font-medium">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
