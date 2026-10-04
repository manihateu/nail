import { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { DayPicker } from "react-day-picker";
import { ru } from "react-day-picker/locale";
import { CalendarDays } from "lucide-react";
import { cn } from "../../lib/utils";
import "react-day-picker/style.css";

type DatePickerProps = {
  value: string;
  onChange: (value: string) => void;
  min: string;
  name?: string;
  label?: string;
  dark?: boolean;
  clearable?: boolean;
  inDialog?: boolean;
};
const parseDate = (value: string) => new Date(value + "T12:00:00");
const toDateValue = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export function DatePicker({
  value,
  onChange,
  min,
  name,
  label = "Выбрать дату",
  dark = false,
  clearable = false,
  inDialog = false,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const selected = value ? parseDate(value) : undefined;
  const earliest = parseDate(min);
  const choose = (day: Date) => {
    onChange(toDateValue(day));
    setOpen(false);
  };
  return (
    <>
      {name && <input type="hidden" name={name} value={value} />}
      <Popover.Root open={open} onOpenChange={setOpen} modal={inDialog}>
        <Popover.Trigger asChild>
          <button
            type="button"
            className={cn("date-trigger", !value && "is-placeholder")}
            aria-label={label}
            title={selected?.toLocaleDateString("ru-RU", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
            aria-description={
              selected
                ? selected.toLocaleDateString("ru-RU")
                : "Дата не выбрана"
            }
          >
            <span>
              {selected
                ? selected.toLocaleDateString("ru-RU", {
                    day: "numeric",
                    month:
                      selected.getFullYear() === earliest.getFullYear()
                        ? "long"
                        : "2-digit",
                    year:
                      selected.getFullYear() === earliest.getFullYear()
                        ? undefined
                        : "numeric",
                  })
                : "Выберите дату"}
            </span>
            <CalendarDays size={18} aria-hidden="true" />
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            className={cn("date-popover", dark && "dark")}
            align="start"
            sideOffset={10}
            collisionPadding={12}
            aria-label="Календарь поездки"
          >
            <div className="calendar-title">
              <CalendarDays size={17} />
              <span>Когда отправимся?</span>
            </div>
            <DayPicker
              mode="single"
              required
              selected={selected}
              onSelect={(day) => day && choose(day)}
              defaultMonth={selected || earliest}
              startMonth={
                new Date(earliest.getFullYear(), earliest.getMonth(), 1)
              }
              disabled={{
                before: new Date(
                  earliest.getFullYear(),
                  earliest.getMonth(),
                  earliest.getDate(),
                ),
              }}
              locale={ru}
              weekStartsOn={1}
              showOutsideDays
              autoFocus
              navLayout="after"
            />
            <div className="calendar-actions">
              <button type="button" onClick={() => choose(earliest)}>
                Сегодня
              </button>
              <button
                type="button"
                onClick={() => {
                  const tomorrow = new Date(earliest);
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  choose(tomorrow);
                }}
              >
                Завтра
              </button>
              {clearable && (
                <button
                  type="button"
                  className="calendar-reset"
                  onClick={() => {
                    onChange("");
                    setOpen(false);
                  }}
                >
                  Без даты
                </button>
              )}
            </div>
            <p className="calendar-hint">Прошедшие даты недоступны</p>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </>
  );
}
