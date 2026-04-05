import { useState, useRef, useEffect } from "react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus } from "lucide-react";
import BlockEditor from "./BlockEditor";
import BlockTypePicker, { BlockType } from "./BlockTypePicker";

interface BlockCanvasProps {
  blocks: any[];
  onChange: (blocks: any[]) => void;
  isCaseStudy: boolean;
}

const defaultBlock = (type: BlockType): any => {
  switch (type) {
    case "heading": return { type, id: crypto.randomUUID(), level: 2, text: "" };
    case "paragraph": return { type, id: crypto.randomUUID(), text: "" };
    case "image": return { type, id: crypto.randomUUID(), src: "", alt: "", caption: "" };
    case "video": return { type, id: crypto.randomUUID(), src: "", provider: "youtube" };
    case "embed": return { type, id: crypto.randomUUID(), html: "" };
    case "quote": return { type, id: crypto.randomUUID(), text: "", attribution: "" };
    case "callout": return { type, id: crypto.randomUUID(), text: "" };
    case "expandable": return { type, id: crypto.randomUUID(), title: "", blocks: [{ type: "paragraph", text: "" }] };
    case "carousel": return { type, id: crypto.randomUUID(), slides: [{ image: "", caption: "" }] };
    case "stat-grid": return { type, id: crypto.randomUUID(), stats: [{ label: "", description: "" }] };
    default: return { type, id: crypto.randomUUID() };
  }
};

function SortableBlock({ block, onChange, onDelete, isCaseStudy }: { block: any; onChange: (b: any) => void; onDelete: () => void; isCaseStudy: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <BlockEditor block={block} onChange={onChange} onDelete={onDelete} isCaseStudy={isCaseStudy} />
    </div>
  );
}

const BlockCanvas = ({ blocks, onChange, isCaseStudy }: BlockCanvasProps) => {
  const [pickerIndex, setPickerIndex] = useState<number | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const ensureIds = (bs: any[]) => bs.map((b) => b.id ? b : { ...b, id: crypto.randomUUID() });
  const safeBlocks = ensureIds(blocks);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = safeBlocks.findIndex((b) => b.id === active.id);
      const newIndex = safeBlocks.findIndex((b) => b.id === over.id);
      onChange(arrayMove(safeBlocks, oldIndex, newIndex));
    }
  };

  const insertBlock = (type: BlockType, atIndex: number) => {
    const newBlocks = [...safeBlocks];
    newBlocks.splice(atIndex, 0, defaultBlock(type));
    onChange(newBlocks);
    setPickerIndex(null);
  };

  const updateBlock = (index: number, block: any) => {
    const newBlocks = [...safeBlocks];
    newBlocks[index] = block;
    onChange(newBlocks);
  };

  const deleteBlock = (index: number) => {
    onChange(safeBlocks.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-0">
      {/* Insert point at top */}
      <InsertPoint index={0} pickerIndex={pickerIndex} setPickerIndex={setPickerIndex} onInsert={insertBlock} isCaseStudy={isCaseStudy} />

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={safeBlocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          {safeBlocks.map((block, i) => (
            <div key={block.id}>
              <SortableBlock
                block={block}
                onChange={(b) => updateBlock(i, b)}
                onDelete={() => deleteBlock(i)}
                isCaseStudy={isCaseStudy}
              />
              <InsertPoint index={i + 1} pickerIndex={pickerIndex} setPickerIndex={setPickerIndex} onInsert={insertBlock} isCaseStudy={isCaseStudy} />
            </div>
          ))}
        </SortableContext>
      </DndContext>

      {safeBlocks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <p className="text-xs" style={{ fontFamily: "'JetBrains Mono', monospace", color: "hsl(0 0% 100% / 0.25)" }}>
            No content blocks yet
          </p>
          <p className="text-[10px]" style={{ fontFamily: "'JetBrains Mono', monospace", color: "hsl(0 0% 100% / 0.15)" }}>
            Click + to add your first block
          </p>
        </div>
      )}
    </div>
  );
};

function InsertPoint({ index, pickerIndex, setPickerIndex, onInsert, isCaseStudy }: {
  index: number;
  pickerIndex: number | null;
  setPickerIndex: (i: number | null) => void;
  onInsert: (type: BlockType, index: number) => void;
  isCaseStudy: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isOpen = pickerIndex === index;

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setPickerIndex(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, setPickerIndex]);

  return (
    <div ref={ref} className="relative group flex items-center justify-center h-6">
      <div className="absolute inset-x-0 top-1/2 h-px opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "hsl(0 80% 48% / 0.2)" }} />
      <button
        onClick={() => setPickerIndex(isOpen ? null : index)}
        className="relative z-10 p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-all"
        style={{ background: "hsl(0 0% 6%)", border: "1px solid hsl(0 80% 48% / 0.3)" }}
      >
        <Plus className="w-3 h-3" style={{ color: "hsl(0 80% 48% / 0.6)" }} />
      </button>
      {isOpen && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1">
          <BlockTypePicker onSelect={(type) => onInsert(type, index)} onClose={() => setPickerIndex(null)} isCaseStudy={isCaseStudy} />
        </div>
      )}
    </div>
  );
}

export default BlockCanvas;
