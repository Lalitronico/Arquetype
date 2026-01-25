"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Key, Plus, Copy, Trash2, Check, AlertTriangle } from "lucide-react";

interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  scopes: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  revokedAt: string | null;
}

export default function ApiSettingsPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [showNewKey, setShowNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchApiKeys();
  }, []);

  async function fetchApiKeys() {
    try {
      const res = await fetch("/api/api-keys");
      const data = await res.json();
      setApiKeys(data.keys || []);
    } catch (error) {
      console.error("Failed to fetch API keys:", error);
    } finally {
      setLoading(false);
    }
  }

  async function createKey() {
    if (!newKeyName.trim()) return;

    setCreating(true);
    try {
      const res = await fetch("/api/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyName }),
      });

      const data = await res.json();
      if (res.ok) {
        setShowNewKey(data.key);
        setNewKeyName("");
        fetchApiKeys();
      }
    } catch (error) {
      console.error("Failed to create API key:", error);
    } finally {
      setCreating(false);
    }
  }

  async function revokeKey(id: string) {
    try {
      await fetch(`/api/api-keys/${id}`, { method: "DELETE" });
      fetchApiKeys();
    } catch (error) {
      console.error("Failed to revoke API key:", error);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const activeKeys = apiKeys.filter((k) => !k.revokedAt);
  const revokedKeys = apiKeys.filter((k) => k.revokedAt);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">API Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage API keys for external integrations
        </p>
      </div>

      {/* New Key Dialog */}
      {showNewKey && (
        <Card className="border-green-500 bg-green-50 dark:bg-green-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <Check className="h-5 w-5" />
              API Key Created
            </CardTitle>
            <CardDescription>
              Copy this key now. You won&apos;t be able to see it again!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <code className="flex-1 p-3 bg-white dark:bg-gray-900 rounded border font-mono text-sm break-all">
                {showNewKey}
              </code>
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(showNewKey)}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <Button
              className="mt-4"
              variant="outline"
              onClick={() => setShowNewKey(null)}
            >
              Done
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create New Key */}
      <Card>
        <CardHeader>
          <CardTitle>Create API Key</CardTitle>
          <CardDescription>
            Generate a new API key for programmatic access to your data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="keyName">Key Name</Label>
              <Input
                id="keyName"
                placeholder="e.g., Production Server, CI/CD Pipeline"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={createKey} disabled={creating || !newKeyName.trim()}>
                <Plus className="h-4 w-4 mr-2" />
                {creating ? "Creating..." : "Create Key"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Keys */}
      <Card>
        <CardHeader>
          <CardTitle>Active API Keys</CardTitle>
          <CardDescription>
            {activeKeys.length} active key{activeKeys.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : activeKeys.length === 0 ? (
            <p className="text-muted-foreground">No active API keys</p>
          ) : (
            <div className="space-y-4">
              {activeKeys.map((key) => (
                <div
                  key={key.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <Key className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{key.name}</p>
                      <p className="text-sm text-muted-foreground font-mono">
                        {key.keyPrefix}...
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right text-sm text-muted-foreground">
                      {key.lastUsedAt ? (
                        <p>Last used: {new Date(key.lastUsedAt).toLocaleDateString()}</p>
                      ) : (
                        <p>Never used</p>
                      )}
                      <p>Created: {new Date(key.createdAt).toLocaleDateString()}</p>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Revoke API Key</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to revoke &quot;{key.name}&quot;? This action cannot be undone.
                            Any applications using this key will lose access immediately.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button variant="outline">Cancel</Button>
                          <Button variant="destructive" onClick={() => revokeKey(key.id)}>
                            Revoke Key
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* API Documentation */}
      <Card>
        <CardHeader>
          <CardTitle>API Usage</CardTitle>
          <CardDescription>
            How to use your API key to access the Syntheia API
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Authentication</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Include your API key in the Authorization header:
            </p>
            <pre className="p-3 bg-muted rounded text-sm overflow-x-auto">
{`curl -X GET "https://api.syntheia.com/v1/studies" \\
  -H "Authorization: Bearer sk_live_your_api_key"`}
            </pre>
          </div>

          <div>
            <h4 className="font-medium mb-2">Available Endpoints</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Badge variant="outline">GET</Badge>
                <code>/v1/studies</code>
                <span className="text-muted-foreground">- List all studies</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">POST</Badge>
                <code>/v1/studies</code>
                <span className="text-muted-foreground">- Create a new study</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">GET</Badge>
                <code>/v1/studies/:id</code>
                <span className="text-muted-foreground">- Get study details</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">POST</Badge>
                <code>/v1/studies/:id/run</code>
                <span className="text-muted-foreground">- Run a study</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">GET</Badge>
                <code>/v1/studies/:id/results</code>
                <span className="text-muted-foreground">- Get study results</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Revoked Keys */}
      {revokedKeys.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-muted-foreground">Revoked Keys</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {revokedKeys.map((key) => (
                <div
                  key={key.id}
                  className="flex items-center justify-between p-3 border rounded-lg opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <Key className="h-4 w-4" />
                    <span>{key.name}</span>
                    <code className="text-xs">{key.keyPrefix}...</code>
                  </div>
                  <Badge variant="secondary">Revoked</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
