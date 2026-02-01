import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { PhoneNumberStatusBadge } from "./PhoneNumberStatusBadge";
import { MoreHorizontal, Bot, Link2, Link2Off, ArrowUpFromLine, Loader2 } from "lucide-react";
import type { PhoneNumberWithAgent } from "@/hooks/usePhoneNumbers";

interface PhoneNumbersTableProps {
  numbers: PhoneNumberWithAgent[];
  variant: "org" | "available";
  onAssign?: (numberId: string) => Promise<boolean>;
  onRelease?: (numberId: string) => Promise<boolean>;
  onConnect?: (numberId: string) => void;
  onDisconnect?: (numberId: string) => Promise<boolean>;
  isLoading?: boolean;
}

const getCountryFlag = (countryCode: string) => {
  try {
    const codePoints = countryCode
      .toUpperCase()
      .split("")
      .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  } catch {
    return "🌐";
  }
};

const formatPhoneNumber = (number: string) => {
  // Basic formatting - just add spaces for readability
  if (number.startsWith("+91")) {
    return `${number.slice(0, 3)} ${number.slice(3, 8)} ${number.slice(8)}`;
  }
  if (number.startsWith("+1")) {
    return `${number.slice(0, 2)} ${number.slice(2, 5)} ${number.slice(5, 8)} ${number.slice(8)}`;
  }
  return number;
};

export function PhoneNumbersTable({
  numbers,
  variant,
  onAssign,
  onRelease,
  onConnect,
  onDisconnect,
  isLoading,
}: PhoneNumbersTableProps) {
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const handleAction = async (
    numberId: string,
    action: (id: string) => Promise<boolean>
  ) => {
    setActionLoadingId(numberId);
    try {
      await action(numberId);
    } finally {
      setActionLoadingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (numbers.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed border-border rounded-lg">
        <p className="text-muted-foreground">
          {variant === "org"
            ? "No phone numbers assigned to your organization yet."
            : "No available phone numbers in the pool."}
        </p>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30">
            <TableHead>Phone Number</TableHead>
            <TableHead>Country / Region</TableHead>
            <TableHead>Status</TableHead>
            {variant === "org" && <TableHead>Agent</TableHead>}
            <TableHead className="text-right">Cost/mo</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {numbers.map((number) => (
            <TableRow key={number.id} className="hover:bg-muted/20">
              <TableCell className="font-mono text-sm">
                <span className="mr-2">{getCountryFlag(number.country)}</span>
                {formatPhoneNumber(number.phone_number)}
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="text-sm text-foreground">{number.country}</span>
                  {number.region && (
                    <span className="text-xs text-muted-foreground">{number.region}</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <PhoneNumberStatusBadge
                  status={number.status}
                  hasAgent={!!number.agent_id}
                />
              </TableCell>
              {variant === "org" && (
                <TableCell>
                  {number.agent ? (
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4 text-primary" />
                      <span className="text-sm">{number.agent.name}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </TableCell>
              )}
              <TableCell className="text-right text-sm text-muted-foreground">
                ₹{Number(number.monthly_cost || 0).toLocaleString()}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      disabled={actionLoadingId === number.id}
                    >
                      {actionLoadingId === number.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <MoreHorizontal className="h-4 w-4" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {variant === "available" && onAssign && (
                      <DropdownMenuItem
                        onClick={() => handleAction(number.id, onAssign)}
                      >
                        <ArrowUpFromLine className="h-4 w-4 mr-2" />
                        Assign to My Org
                      </DropdownMenuItem>
                    )}
                    {variant === "org" && (
                      <>
                        {!number.agent_id && onConnect && (
                          <DropdownMenuItem onClick={() => onConnect(number.id)}>
                            <Link2 className="h-4 w-4 mr-2" />
                            Connect to Agent
                          </DropdownMenuItem>
                        )}
                        {number.agent_id && onDisconnect && (
                          <DropdownMenuItem
                            onClick={() => handleAction(number.id, onDisconnect)}
                          >
                            <Link2Off className="h-4 w-4 mr-2" />
                            Disconnect from Agent
                          </DropdownMenuItem>
                        )}
                        {onRelease && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleAction(number.id, onRelease)}
                              className="text-destructive focus:text-destructive"
                              disabled={!!number.agent_id}
                            >
                              <ArrowUpFromLine className="h-4 w-4 mr-2" />
                              Release Number
                            </DropdownMenuItem>
                          </>
                        )}
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
