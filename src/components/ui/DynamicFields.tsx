import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";

export interface Contact {
  name: string;
  number: string;
}

interface DynamicFieldsProps {
  value: Contact[];
  onChange: (fields: Contact[]) => void;
  disabled?: boolean;
}

export default function DynamicFields({ value, onChange, disabled }: DynamicFieldsProps) {
  const handleAdd = () => {
    if (disabled) return;
    onChange([...value, { name: "", number: "" }]);
  };

  const handleRemove = (index: number) => {
    if (disabled) return;
    onChange(value.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, key: keyof Contact, fieldValue: string) => {
    if (disabled) return;
    const updated = [...value];
    updated[index][key] = fieldValue;
    onChange(updated);
  };

  return (
    <div className="space-y-2">
      {value.map((field, index) => (
        <div key={index} className="flex gap-2 items-center">
          <Input
            placeholder="Name"
            value={field.name}
            onChange={(e) => handleChange(index, "name", e.target.value)}
            disabled={disabled} 
            className={disabled ? "bg-muted" : ""}
          />
          <Input
            placeholder="Number"
            value={field.number}
            onChange={(e) => handleChange(index, "number", e.target.value)}
            disabled={disabled} 
            className={disabled ? "bg-muted" : ""}
          />

          {!disabled && (
            <Button
              type="button"
              size="icon"
              variant="destructive"
              onClick={() => handleRemove(index)}
              disabled={value.length <= 1}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      ))}

      {!disabled && (
        <Button type="button" variant="outline" onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-1" /> Add Contact
        </Button>
      )}
    </div>
  );
}