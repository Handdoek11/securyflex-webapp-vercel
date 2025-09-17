"use client";

import React from "react";
import { useFormContext, RegisterOptions } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, AlertCircle, Info } from "lucide-react";

// Base form field props
interface BaseFormFieldProps {
  name: string;
  label?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  rules?: RegisterOptions;
}

// Input field component
interface InputFieldProps extends BaseFormFieldProps {
  type?: "text" | "email" | "password" | "tel" | "number" | "url";
  placeholder?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  min?: number;
  max?: number;
  step?: number;
}

export function InputField({
  name,
  label,
  description,
  type = "text",
  placeholder,
  required,
  disabled,
  className,
  rules,
  leftIcon,
  rightIcon,
  min,
  max,
  step,
}: InputFieldProps) {
  const { register, formState: { errors }, watch } = useFormContext();
  const [showPassword, setShowPassword] = React.useState(false);
  const error = errors[name];

  const inputType = type === "password" && showPassword ? "text" : type;

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label htmlFor={name} className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}

      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
            {leftIcon}
          </div>
        )}

        <Input
          id={name}
          type={inputType}
          placeholder={placeholder}
          disabled={disabled}
          min={min}
          max={max}
          step={step}
          className={cn(
            leftIcon && "pl-10",
            (rightIcon || type === "password") && "pr-10",
            error && "border-red-500 focus-visible:ring-red-500"
          )}
          {...register(name, rules)}
        />

        {type === "password" && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
            disabled={disabled}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        )}

        {rightIcon && type !== "password" && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
            {rightIcon}
          </div>
        )}
      </div>

      {description && (
        <p className="text-sm text-muted-foreground flex items-center gap-1">
          <Info className="h-3 w-3" />
          {description}
        </p>
      )}

      {error && (
        <p className="text-sm text-red-500 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error.message as string}
        </p>
      )}
    </div>
  );
}

// Textarea field component
interface TextareaFieldProps extends BaseFormFieldProps {
  placeholder?: string;
  rows?: number;
  maxLength?: number;
}

export function TextareaField({
  name,
  label,
  description,
  placeholder,
  required,
  disabled,
  className,
  rules,
  rows = 3,
  maxLength,
}: TextareaFieldProps) {
  const { register, formState: { errors }, watch } = useFormContext();
  const error = errors[name];
  const value = watch(name) || "";

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label htmlFor={name} className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}

      <div className="relative">
        <Textarea
          id={name}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          maxLength={maxLength}
          className={cn(
            error && "border-red-500 focus-visible:ring-red-500"
          )}
          {...register(name, rules)}
        />

        {maxLength && (
          <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
            {value.length}/{maxLength}
          </div>
        )}
      </div>

      {description && (
        <p className="text-sm text-muted-foreground flex items-center gap-1">
          <Info className="h-3 w-3" />
          {description}
        </p>
      )}

      {error && (
        <p className="text-sm text-red-500 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error.message as string}
        </p>
      )}
    </div>
  );
}

// Select field component
interface SelectFieldProps extends BaseFormFieldProps {
  placeholder?: string;
  options: { value: string; label: string; disabled?: boolean }[];
}

export function SelectField({
  name,
  label,
  description,
  placeholder,
  required,
  disabled,
  className,
  rules,
  options,
}: SelectFieldProps) {
  const { register, formState: { errors }, setValue, watch } = useFormContext();
  const error = errors[name];
  const value = watch(name);

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label htmlFor={name} className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}

      <Select
        value={value || ""}
        onValueChange={(value) => setValue(name, value)}
        disabled={disabled}
      >
        <SelectTrigger className={cn(error && "border-red-500 focus:ring-red-500")}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {description && (
        <p className="text-sm text-muted-foreground flex items-center gap-1">
          <Info className="h-3 w-3" />
          {description}
        </p>
      )}

      {error && (
        <p className="text-sm text-red-500 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error.message as string}
        </p>
      )}
    </div>
  );
}

// Checkbox field component
interface CheckboxFieldProps extends BaseFormFieldProps {
  checkboxLabel?: string;
}

export function CheckboxField({
  name,
  label,
  checkboxLabel,
  description,
  required,
  disabled,
  className,
  rules,
}: CheckboxFieldProps) {
  const { register, formState: { errors }, setValue, watch } = useFormContext();
  const error = errors[name];
  const checked = watch(name) || false;

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}

      <div className="flex items-center space-x-2">
        <Checkbox
          id={name}
          checked={checked}
          onCheckedChange={(checked) => setValue(name, checked)}
          disabled={disabled}
          className={cn(error && "border-red-500")}
        />
        {checkboxLabel && (
          <Label
            htmlFor={name}
            className="text-sm font-normal cursor-pointer"
          >
            {checkboxLabel}
          </Label>
        )}
      </div>

      {description && (
        <p className="text-sm text-muted-foreground flex items-center gap-1">
          <Info className="h-3 w-3" />
          {description}
        </p>
      )}

      {error && (
        <p className="text-sm text-red-500 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error.message as string}
        </p>
      )}
    </div>
  );
}

// Switch field component
interface SwitchFieldProps extends BaseFormFieldProps {
  switchLabel?: string;
}

export function SwitchField({
  name,
  label,
  switchLabel,
  description,
  required,
  disabled,
  className,
  rules,
}: SwitchFieldProps) {
  const { register, formState: { errors }, setValue, watch } = useFormContext();
  const error = errors[name];
  const checked = watch(name) || false;

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}

      <div className="flex items-center justify-between">
        <div>
          {switchLabel && (
            <Label htmlFor={name} className="text-sm font-normal">
              {switchLabel}
            </Label>
          )}
          {description && (
            <p className="text-sm text-muted-foreground mt-1">
              {description}
            </p>
          )}
        </div>
        <Switch
          id={name}
          checked={checked}
          onCheckedChange={(checked) => setValue(name, checked)}
          disabled={disabled}
        />
      </div>

      {error && (
        <p className="text-sm text-red-500 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error.message as string}
        </p>
      )}
    </div>
  );
}

// Multi-select field component (for arrays)
interface MultiSelectFieldProps extends BaseFormFieldProps {
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function MultiSelectField({
  name,
  label,
  description,
  placeholder,
  required,
  disabled,
  className,
  rules,
  options,
}: MultiSelectFieldProps) {
  const { register, formState: { errors }, setValue, watch } = useFormContext();
  const error = errors[name];
  const selectedValues = watch(name) || [];

  const toggleValue = (value: string) => {
    const currentValues = selectedValues;
    const isSelected = currentValues.includes(value);

    if (isSelected) {
      setValue(name, currentValues.filter((v: string) => v !== value));
    } else {
      setValue(name, [...currentValues, value]);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}

      <div className="grid grid-cols-2 gap-2">
        {options.map((option) => (
          <div key={option.value} className="flex items-center space-x-2">
            <Checkbox
              id={`${name}-${option.value}`}
              checked={selectedValues.includes(option.value)}
              onCheckedChange={() => toggleValue(option.value)}
              disabled={disabled}
            />
            <Label
              htmlFor={`${name}-${option.value}`}
              className="text-sm font-normal cursor-pointer"
            >
              {option.label}
            </Label>
          </div>
        ))}
      </div>

      {description && (
        <p className="text-sm text-muted-foreground flex items-center gap-1">
          <Info className="h-3 w-3" />
          {description}
        </p>
      )}

      {error && (
        <p className="text-sm text-red-500 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error.message as string}
        </p>
      )}
    </div>
  );
}

// Form section component for organizing large forms
interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormSection({
  title,
  description,
  children,
  className,
}: FormSectionProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

// Form grid for organizing fields in columns
interface FormGridProps {
  children: React.ReactNode;
  columns?: number;
  className?: string;
}

export function FormGrid({
  children,
  columns = 2,
  className,
}: FormGridProps) {
  return (
    <div className={cn(
      "grid gap-4",
      {
        "grid-cols-1": columns === 1,
        "grid-cols-1 md:grid-cols-2": columns === 2,
        "grid-cols-1 md:grid-cols-2 lg:grid-cols-3": columns === 3,
        "grid-cols-1 md:grid-cols-2 lg:grid-cols-4": columns === 4,
      },
      className
    )}>
      {children}
    </div>
  );
}