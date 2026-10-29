import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { X } from "lucide-react";

interface MobileFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  positionFilter: string | null;
  onPositionChange: (value: string | null) => void;
  positions: string[];
  onApply: () => void;
  onClear: () => void;
}

export function MobileFilterModal({
  isOpen,
  onClose,
  searchQuery,
  onSearchChange,
  positionFilter,
  onPositionChange,
  positions,
  onApply,
  onClear,
}: MobileFilterModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" aria-describedby="filter-description">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Filter Dashboard</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Close filter modal"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p id="filter-description" className="text-sm text-muted-foreground">
            Refine your dashboard view by applying filters
          </p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="mobile-search">Search</Label>
            <Input
              id="mobile-search"
              placeholder="Search voters or candidates..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              aria-label="Search voters or candidates"
            />
          </div>

          {/* Position Filter */}
          <div className="space-y-3">
            <Label>Position</Label>
            <RadioGroup
              value={positionFilter || "all"}
              onValueChange={(value) => onPositionChange(value === "all" ? null : value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all" />
                <Label htmlFor="all" className="font-normal cursor-pointer">
                  All Positions
                </Label>
              </div>
              {positions.map((position) => (
                <div key={position} className="flex items-center space-x-2">
                  <RadioGroupItem value={position} id={position} />
                  <Label htmlFor={position} className="font-normal cursor-pointer">
                    {position}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>

        <DialogFooter className="flex-row gap-2">
          <Button variant="outline" onClick={onClear} className="flex-1">
            Clear All
          </Button>
          <Button onClick={onApply} className="flex-1">
            Apply Filters
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
