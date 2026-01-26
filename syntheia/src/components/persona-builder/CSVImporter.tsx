"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, FileText, X, AlertCircle, CheckCircle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface ImportedPersona {
  age?: number;
  gender?: string;
  location?: string;
  income?: string;
  education?: string;
  occupation?: string;
  values?: string[];
  lifestyle?: string;
  interests?: string[];
  personality?: string;
}

interface CSVImporterProps {
  onImport: (personas: ImportedPersona[]) => void;
}

interface ColumnMapping {
  [key: string]: string;
}

const PERSONA_FIELDS = [
  { key: "age", label: "Age", required: false },
  { key: "gender", label: "Gender", required: false },
  { key: "location", label: "Location", required: false },
  { key: "income", label: "Income", required: false },
  { key: "education", label: "Education", required: false },
  { key: "occupation", label: "Occupation", required: false },
  { key: "values", label: "Values (comma-separated)", required: false },
  { key: "lifestyle", label: "Lifestyle", required: false },
  { key: "interests", label: "Interests (comma-separated)", required: false },
  { key: "personality", label: "Personality", required: false },
];

export function CSVImporter({ onImport }: CSVImporterProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [previewData, setPreviewData] = useState<string[][]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({});
  const [error, setError] = useState<string | null>(null);
  const [importedCount, setImportedCount] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseCSV = (text: string): { headers: string[]; data: string[][] } => {
    const lines = text.split(/\r?\n/).filter((line) => line.trim());
    if (lines.length === 0) {
      throw new Error("CSV file is empty");
    }

    const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
    const data = lines.slice(1).map((line) => {
      // Simple CSV parsing (handles basic quoted values)
      const values: string[] = [];
      let current = "";
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          values.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      values.push(current.trim());

      return values;
    });

    return { headers, data };
  };

  const handleFile = useCallback((file: File) => {
    setError(null);
    setImportedCount(null);

    if (!file.name.endsWith(".csv")) {
      setError("Please upload a CSV file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const { headers, data } = parseCSV(text);

        setFile(file);
        setHeaders(headers);
        setPreviewData(data.slice(0, 5)); // Preview first 5 rows

        // Auto-map columns based on header names
        const autoMapping: ColumnMapping = {};
        headers.forEach((header) => {
          const lowerHeader = header.toLowerCase();
          PERSONA_FIELDS.forEach((field) => {
            if (
              lowerHeader === field.key ||
              lowerHeader.includes(field.key) ||
              field.label.toLowerCase().includes(lowerHeader)
            ) {
              autoMapping[field.key] = header;
            }
          });
        });
        setColumnMapping(autoMapping);
      } catch {
        setError("Failed to parse CSV file. Please check the format.");
      }
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) {
        handleFile(droppedFile);
      }
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        handleFile(selectedFile);
      }
    },
    [handleFile]
  );

  const updateMapping = (field: string, header: string) => {
    setColumnMapping((prev) => ({
      ...prev,
      [field]: header === "none" ? "" : header,
    }));
  };

  const processImport = () => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const { data } = parseCSV(text);

        const personas: ImportedPersona[] = data.map((row) => {
          const persona: ImportedPersona = {};

          PERSONA_FIELDS.forEach((field) => {
            const headerIndex = headers.indexOf(columnMapping[field.key]);
            if (headerIndex !== -1 && row[headerIndex]) {
              const value = row[headerIndex];
              if (field.key === "age") {
                persona.age = parseInt(value);
              } else if (field.key === "values" || field.key === "interests") {
                (persona as Record<string, unknown>)[field.key] = value.split(",").map((v) => v.trim());
              } else {
                (persona as Record<string, unknown>)[field.key] = value;
              }
            }
          });

          return persona;
        });

        // Filter out empty personas
        const validPersonas = personas.filter(
          (p) => Object.keys(p).length > 0
        );

        setImportedCount(validPersonas.length);
        onImport(validPersonas);
      } catch {
        setError("Failed to import personas. Please check your data.");
      }
    };
    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const headers = PERSONA_FIELDS.map((f) => f.key).join(",");
    const exampleRow = [
      "32",
      "female",
      "New York, NY",
      "$75,000 - $100,000",
      "Bachelor's degree",
      "Software Engineer",
      "Career success,Innovation",
      "Tech-savvy early adopter",
      "Technology,Travel,Fitness",
      "Analytical and detail-oriented",
    ].join(",");
    const csv = `${headers}\n${exampleRow}`;

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "persona-template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearFile = () => {
    setFile(null);
    setHeaders([]);
    setPreviewData([]);
    setColumnMapping({});
    setError(null);
    setImportedCount(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Import from CSV</CardTitle>
        <CardDescription>Upload a CSV file with persona data</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Download Template */}
        <Button variant="outline" size="sm" onClick={downloadTemplate} className="gap-2">
          <Download className="h-4 w-4" />
          Download Template
        </Button>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-700">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Success Message */}
        {importedCount !== null && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 text-green-700">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">Successfully imported {importedCount} personas</span>
          </div>
        )}

        {/* Drop Zone */}
        {!file ? (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragging
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileInput}
              className="hidden"
            />
            <Upload className="h-8 w-8 mx-auto mb-3 text-gray-400" />
            <p className="text-sm text-gray-600">
              Drag and drop a CSV file here, or click to browse
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Supports .csv files with persona data
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* File Info */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {headers.length} columns, {previewData.length}+ rows
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={clearFile}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Column Mapping */}
            <div className="space-y-3">
              <p className="text-sm font-medium">Map columns to persona fields:</p>
              <div className="grid grid-cols-2 gap-3">
                {PERSONA_FIELDS.map((field) => (
                  <div key={field.key} className="flex items-center gap-2">
                    <span className="text-sm w-32 truncate">{field.label}</span>
                    <Select
                      value={columnMapping[field.key] || "none"}
                      onValueChange={(val) => updateMapping(field.key, val)}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">-- Not mapped --</SelectItem>
                        {headers.map((header) => (
                          <SelectItem key={header} value={header}>
                            {header}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>

            {/* Preview */}
            {previewData.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Preview (first 5 rows):</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        {headers.map((header, i) => (
                          <th key={i} className="px-2 py-1 text-left border-b">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.map((row, i) => (
                        <tr key={i} className="border-b last:border-0">
                          {row.map((cell, j) => (
                            <td key={j} className="px-2 py-1 truncate max-w-[150px]">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Mapped Fields Summary */}
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-gray-500">Mapped:</span>
              {PERSONA_FIELDS.filter((f) => columnMapping[f.key]).map((field) => (
                <Badge key={field.key} variant="secondary" className="text-xs">
                  {field.label}
                </Badge>
              ))}
            </div>

            {/* Import Button */}
            <Button
              onClick={processImport}
              disabled={Object.values(columnMapping).filter(Boolean).length === 0}
              className="w-full"
            >
              Import Personas
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
