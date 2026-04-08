import { useState, useRef, useEffect } from "react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus } from "lucide-react";
import BlockEditor from "./BlockEditor";
import BlockTypePicker, { BlockType } from "./BlockTypePicker";
import { useIsMobile } from "@/hooks/use-mobile";

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

function SortableBlock({ block, onChange, onDelete, onInsertAfter, onDeleteEmpty, onSlashCommand, isCaseStudy }: {
  block: any; onChange: (b: any) => void; onDelete: () => void; onInsertAfter: () => void; onDeleteEmpty: () => void; onSlashCommand: () => void; isCaseStudy: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };
  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <BlockEditor block={block} onChange={onChange} onDelete={onDelete} onInsertAfter={onInsertAfter} onDeleteEmpty={onDeleteEmpty} onSlashCommand={onSlashCommand} isCaseStudy={isCaseStudy} dragHandleProps={listeners} />
    </div>
  );
}

const label: React.CSSProperties = { fontFamily: "'DM Sans', sans-serif" };

const BlockCanvas = ({ blocks, onChange, isCaseStudy }: BlockCanvasProps) => {
  const [pickerIndex, setPickerIndex] = useState<number | null>(null);
  const [slashIndex, setSlashIndex] = useState<number | null>(null);
  const [slashFilter, setSlashFilter] = useState("");
  const isMobile = useIsMobile();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

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
    setSlashIndex(null);
    setSlashFilter("");
  };

  const insertParagraphAfter = (index: number) => {
    const newBlocks = [...safeBlocks];
    newBlocks.splice(index + 1, 0, defaultBlock("paragraph"));
    onChange(newBlocks);
  };

  const updateBlock = (index: number, block: any) => {
    const newBlocks = [...safeBlocks];
    newBlocks[index] = block;
    onChange(newBlocks);
  };

  const deleteBlock = (index: number) => {
    onChange(safeBlocks.filter((_, i) => i !== index));
  };

  const handleSlashCommand = (index: number) => {
    setSlashIndex(index);
    setSlashFilter("");
  };

  const handleSlashSelect = (type: BlockType) => {
    if (slashIndex !== null) {
      const newBlocks = [...safeBlocks];
      const newBlock = defaultBlock(type);
      newBlock.id = newBlocks[slashIndex].id;
      newBlocks[slashIndex] = newBlock;
      onChange(newBlocks);
      setSlashIndex(null);
      setSlashFilter("");
    }
  };

  return (
    <div className="space-y-0 relative">
      <InsertPoint index={0} pickerIndex={pickerIndex} setPickerIndex={setPickerIndex} onInsert={insertBlock} isCaseStudy={isCaseStudy} />

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={safeBlocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          {safeBlocks.map((block, i) => (
            <div key={block.id} className="relative">
              <SortableBlock
                block={block}
                onChange={(b) => updateBlock(i, b)}
                onDelete={() => deleteBlock(i)}
                onInsertAfter={() => insertParagraphAfter(i)}
                onDeleteEmpty={() => deleteBlock(i)}
                onSlashCommand={() => handleSlashCommand(i)}
                isCaseStudy={isCaseStudy}
              />
              {slashIndex === i && (
                <div className="absolute left-10 top-full z-50 mt-1">
                  <BlockTypePicker onSelect={handleSlashSelect} onClose={() => { setSlashIndex(null); setSlashFilter(""); }} isCaseStudy={isCaseStudy} filter={slashFilter} />
                </div>
              )}
              <InsertPoint index={i + 1} pickerIndex={pickerIndex} setPickerIndex={setPickerIndex} onInsert={insertBlock} isCaseStudy={isCaseStudy} />
            </div>
          ))}
        </SortableContext>
      </DndContext>

      {safeBlocks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <p className="text-sm" style={{ ...label, color: "hsl(30 10% 12% / 0.25)" }}>Start writing</p>
          <button
            onClick={() => setPickerIndex(0)}
            className="p-3 rounded-full transition-all hover:scale-105"
            style={{ background: "hsl(0 0% 100%)", border: "1px solid hsl(30 10% 12% / 0.1)" }}
          >
            <Plus className="w-5 h-5" style={{ color: "hsl(30 10% 12% / 0.4)" }} />
          </button>
        </div>
      )}

      {isMobile && safeBlocks.length > 0 && (
        <button
          onClick={() => setPickerIndex(safeBlocks.length)}
          className="w-full py-3 flex items-center justify-center gap-2 mt-2 rounded-xl transition-colors"
          style={{ background: "hsl(0 0% 100%)", border: "1px solid hsl(30 10% 12% / 0.06)" }}
        >
          <Plus className="w-4 h-4" style={{ color: "hsl(30 10% 12% / 0.3)" }} />
          <span className="text-[11px]" style={{ ...label, color: "hsl(30 10% 12% / 0.3)" }}>Add block</span>
        </button>
      )}
    </div>
  );
};

function InsertPoint({ index, pickerIndex, setPickerIndex, onInsert, isCaseStudy }: {
  index: number; pickerIndex: number | null; setPickerIndex: (i: number | null) => void; onInsert: (type: BlockType, index: number) => void; isCaseStudy: boolean;
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
    <div ref={ref} className="relative group flex items-center justify-center" style={{ height: "12px" }}>
      <div className="absolute inset-x-6 top-1/2 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: "hsl(30 10% 12% / 0.06)" }} />
      <button
        onClick={() => setPickerIndex(isOpen ? null : index)}
        className="relative z-10 p-0.5 rounded-full opacity-0 group-hover:opacity-30 transition-all duration-200"
        style={{ background: "hsl(0 0% 100%)", border: "1px solid hsl(30 10% 12% / 0.1)" }}
      >
        <Plus className="w-3 h-3" style={{ color: "hsl(30 10% 12% / 0.5)" }} />
      </button>
      {isOpen && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-50">
          <BlockTypePicker onSelect={(type) => onInsert(type, index)} onClose={() => setPickerIndex(null)} isCaseStudy={isCaseStudy} />
        </div>
      )}
    </div>
  );
}

export default BlockCanvas;
