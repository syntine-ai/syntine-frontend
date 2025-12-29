import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface ContactsFiltersBarProps {
  onSearchChange: (value: string) => void;
  onListChange: (value: string) => void;
  onCampaignChange: (value: string) => void;
  onSentimentChange: (values: string[]) => void;
  onOutcomeChange: (values: string[]) => void;
}

const sentimentOptions = ["Positive", "Neutral", "Negative"];
const outcomeOptions = ["Connected", "No Answer", "Voicemail", "Rejected"];

export function ContactsFiltersBar({
  onSearchChange,
  onListChange,
  onCampaignChange,
  onSentimentChange,
  onOutcomeChange,
}: ContactsFiltersBarProps) {
  const [search, setSearch] = useState("");
  const [selectedSentiments, setSelectedSentiments] = useState<string[]>([]);
  const [selectedOutcomes, setSelectedOutcomes] = useState<string[]>([]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    onSearchChange(value);
  };

  const handleSentimentToggle = (sentiment: string) => {
    const newSentiments = selectedSentiments.includes(sentiment)
      ? selectedSentiments.filter((s) => s !== sentiment)
      : [...selectedSentiments, sentiment];
    setSelectedSentiments(newSentiments);
    onSentimentChange(newSentiments);
  };

  const handleOutcomeToggle = (outcome: string) => {
    const newOutcomes = selectedOutcomes.includes(outcome)
      ? selectedOutcomes.filter((o) => o !== outcome)
      : [...selectedOutcomes, outcome];
    setSelectedOutcomes(newOutcomes);
    onOutcomeChange(newOutcomes);
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedSentiments([]);
    setSelectedOutcomes([]);
    onSearchChange("");
    onSentimentChange([]);
    onOutcomeChange([]);
  };

  const hasActiveFilters = search || selectedSentiments.length > 0 || selectedOutcomes.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap items-center gap-3 p-4 bg-card border border-border rounded-lg"
    >
      {/* Search Input */}
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or phone"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9 bg-background"
        />
      </div>

      {/* List Filter */}
      <Select onValueChange={onListChange} defaultValue="all">
        <SelectTrigger className="w-[160px] bg-background">
          <SelectValue placeholder="All Lists" />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border z-50">
          <SelectItem value="all">All Lists</SelectItem>
          <SelectItem value="leads-jan">Leads - Jan</SelectItem>
          <SelectItem value="hot-prospects">Hot Prospects</SelectItem>
          <SelectItem value="re-engagement">Re-engagement</SelectItem>
        </SelectContent>
      </Select>

      {/* Campaign Filter */}
      <Select onValueChange={onCampaignChange} defaultValue="all">
        <SelectTrigger className="w-[180px] bg-background">
          <SelectValue placeholder="All Campaigns" />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border z-50">
          <SelectItem value="all">All Campaigns</SelectItem>
          <SelectItem value="sales-followup">Sales Follow-up</SelectItem>
          <SelectItem value="loan-outreach">Loan Outreach</SelectItem>
          <SelectItem value="renewal">Renewal Campaign</SelectItem>
        </SelectContent>
      </Select>

      {/* Sentiment Multi-Select */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "gap-2 bg-background",
              selectedSentiments.length > 0 && "border-primary text-primary"
            )}
          >
            <Filter className="h-4 w-4" />
            Sentiment
            {selectedSentiments.length > 0 && (
              <span className="ml-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                {selectedSentiments.length}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-3 bg-popover border-border z-50" align="start">
          <div className="space-y-2">
            {sentimentOptions.map((sentiment) => (
              <label
                key={sentiment}
                className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-1.5 rounded"
              >
                <Checkbox
                  checked={selectedSentiments.includes(sentiment)}
                  onCheckedChange={() => handleSentimentToggle(sentiment)}
                />
                <span className="text-sm">{sentiment}</span>
              </label>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Outcome Multi-Select */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "gap-2 bg-background",
              selectedOutcomes.length > 0 && "border-primary text-primary"
            )}
          >
            <Filter className="h-4 w-4" />
            Outcome
            {selectedOutcomes.length > 0 && (
              <span className="ml-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                {selectedOutcomes.length}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-3 bg-popover border-border z-50" align="start">
          <div className="space-y-2">
            {outcomeOptions.map((outcome) => (
              <label
                key={outcome}
                className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-1.5 rounded"
              >
                <Checkbox
                  checked={selectedOutcomes.includes(outcome)}
                  onCheckedChange={() => handleOutcomeToggle(outcome)}
                />
                <span className="text-sm">{outcome}</span>
              </label>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1.5 text-muted-foreground">
          <X className="h-4 w-4" />
          Clear
        </Button>
      )}
    </motion.div>
  );
}
