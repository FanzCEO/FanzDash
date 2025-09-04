import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Globe,
  MapPin,
  Languages,
} from "lucide-react";

const countrySchema = z.object({
  countryCode: z
    .string()
    .min(2, "Country code must be at least 2 characters")
    .max(3, "Country code must be at most 3 characters"),
  countryName: z.string().min(1, "Country name is required"),
  isActive: z.boolean().default(true),
});

const stateSchema = z.object({
  countryId: z.string().min(1, "Country is required"),
  stateCode: z.string().min(1, "State code is required"),
  stateName: z.string().min(1, "State name is required"),
  isActive: z.boolean().default(true),
});

const languageSchema = z.object({
  languageName: z.string().min(1, "Language name is required"),
  languageCode: z
    .string()
    .min(2, "Language code must be at least 2 characters")
    .max(5, "Language code must be at most 5 characters"),
  isActive: z.boolean().default(true),
  isDefault: z.boolean().default(false),
});

type CountryForm = z.infer<typeof countrySchema>;
type StateForm = z.infer<typeof stateSchema>;
type LanguageForm = z.infer<typeof languageSchema>;

interface Country {
  id: string;
  countryCode: string;
  countryName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface State {
  id: string;
  countryId: string;
  stateCode: string;
  stateName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Language {
  id: string;
  languageName: string;
  languageCode: string;
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function LocationManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingCountry, setEditingCountry] = useState<Country | null>(null);
  const [editingState, setEditingState] = useState<State | null>(null);
  const [editingLanguage, setEditingLanguage] = useState<Language | null>(null);
  const [showCountryForm, setShowCountryForm] = useState(false);
  const [showStateForm, setShowStateForm] = useState(false);
  const [showLanguageForm, setShowLanguageForm] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Country queries and mutations
  const { data: countries = [], isLoading: loadingCountries } = useQuery({
    queryKey: ["/api/countries"],
    queryFn: () =>
      fetch("/api/countries").then((res) => res.json()) as Promise<Country[]>,
  });

  const countryForm = useForm<CountryForm>({
    resolver: zodResolver(countrySchema),
    defaultValues: {
      countryCode: "",
      countryName: "",
      isActive: true,
    },
  });

  const createCountryMutation = useMutation({
    mutationFn: (data: CountryForm) =>
      fetch("/api/countries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/countries"] });
      toast({ title: "Success", description: "Country created successfully" });
      countryForm.reset();
      setShowCountryForm(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create country",
        variant: "destructive",
      });
    },
  });

  const updateCountryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CountryForm> }) =>
      fetch(`/api/countries/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/countries"] });
      toast({ title: "Success", description: "Country updated successfully" });
      setEditingCountry(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update country",
        variant: "destructive",
      });
    },
  });

  const deleteCountryMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/countries/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/countries"] });
      toast({ title: "Success", description: "Country deleted successfully" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete country",
        variant: "destructive",
      });
    },
  });

  // State queries and mutations
  const { data: states = [], isLoading: loadingStates } = useQuery({
    queryKey: ["/api/states"],
    queryFn: () =>
      fetch("/api/states").then((res) => res.json()) as Promise<State[]>,
  });

  const stateForm = useForm<StateForm>({
    resolver: zodResolver(stateSchema),
    defaultValues: {
      countryId: "",
      stateCode: "",
      stateName: "",
      isActive: true,
    },
  });

  const createStateMutation = useMutation({
    mutationFn: (data: StateForm) =>
      fetch("/api/states", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/states"] });
      toast({ title: "Success", description: "State created successfully" });
      stateForm.reset();
      setShowStateForm(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create state",
        variant: "destructive",
      });
    },
  });

  const updateStateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<StateForm> }) =>
      fetch(`/api/states/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/states"] });
      toast({ title: "Success", description: "State updated successfully" });
      setEditingState(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update state",
        variant: "destructive",
      });
    },
  });

  const deleteStateMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/states/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/states"] });
      toast({ title: "Success", description: "State deleted successfully" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete state",
        variant: "destructive",
      });
    },
  });

  // Language queries and mutations
  const { data: languages = [], isLoading: loadingLanguages } = useQuery({
    queryKey: ["/api/languages"],
    queryFn: () =>
      fetch("/api/languages").then((res) => res.json()) as Promise<Language[]>,
  });

  const languageForm = useForm<LanguageForm>({
    resolver: zodResolver(languageSchema),
    defaultValues: {
      languageName: "",
      languageCode: "",
      isActive: true,
      isDefault: false,
    },
  });

  const createLanguageMutation = useMutation({
    mutationFn: (data: LanguageForm) =>
      fetch("/api/languages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/languages"] });
      toast({ title: "Success", description: "Language created successfully" });
      languageForm.reset();
      setShowLanguageForm(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create language",
        variant: "destructive",
      });
    },
  });

  const updateLanguageMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<LanguageForm> }) =>
      fetch(`/api/languages/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/languages"] });
      toast({ title: "Success", description: "Language updated successfully" });
      setEditingLanguage(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update language",
        variant: "destructive",
      });
    },
  });

  const deleteLanguageMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/languages/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/languages"] });
      toast({ title: "Success", description: "Language deleted successfully" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete language",
        variant: "destructive",
      });
    },
  });

  const filteredCountries = countries.filter(
    (country) =>
      country.countryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      country.countryCode.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredStates = states.filter(
    (state) =>
      state.stateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      state.stateCode.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredLanguages = languages.filter(
    (language) =>
      language.languageName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      language.languageCode.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Location Management
          </h1>
          <p className="text-muted-foreground">
            Manage countries, states, and languages
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Location & Language Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
                data-testid="input-search-locations"
              />
            </div>
          </div>

          <Tabs defaultValue="countries" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger
                value="countries"
                className="flex items-center space-x-2"
              >
                <Globe className="w-4 h-4" />
                <span>Countries</span>
              </TabsTrigger>
              <TabsTrigger
                value="states"
                className="flex items-center space-x-2"
              >
                <MapPin className="w-4 h-4" />
                <span>States</span>
              </TabsTrigger>
              <TabsTrigger
                value="languages"
                className="flex items-center space-x-2"
              >
                <Languages className="w-4 h-4" />
                <span>Languages</span>
              </TabsTrigger>
            </TabsList>

            {/* Countries Tab */}
            <TabsContent value="countries">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">
                  Countries ({filteredCountries.length})
                </h3>
                <Button
                  onClick={() => setShowCountryForm(true)}
                  data-testid="button-add-country"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Country
                </Button>
              </div>

              {showCountryForm && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Add New Country</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Form {...countryForm}>
                      <form
                        onSubmit={countryForm.handleSubmit((data) =>
                          createCountryMutation.mutate(data),
                        )}
                        className="space-y-4"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={countryForm.control}
                            name="countryCode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Country Code</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="US, CA, GB..."
                                    {...field}
                                    data-testid="input-country-code"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={countryForm.control}
                            name="countryName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Country Name</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="United States, Canada..."
                                    {...field}
                                    data-testid="input-country-name"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={countryForm.control}
                            name="isActive"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">
                                    Active
                                  </FormLabel>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    data-testid="switch-country-active"
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowCountryForm(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            disabled={createCountryMutation.isPending}
                          >
                            {createCountryMutation.isPending
                              ? "Creating..."
                              : "Create Country"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-2">
                {loadingCountries ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="animate-pulse h-12 bg-gray-200 rounded"
                      ></div>
                    ))}
                  </div>
                ) : (
                  filteredCountries.map((country) => (
                    <div
                      key={country.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                      data-testid={`card-country-${country.id}`}
                    >
                      <div className="flex items-center space-x-4">
                        <Badge
                          variant={country.isActive ? "default" : "secondary"}
                        >
                          {country.countryCode}
                        </Badge>
                        <div>
                          <p className="font-medium">{country.countryName}</p>
                          <p className="text-sm text-muted-foreground">
                            {country.isActive ? "Active" : "Inactive"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingCountry(country)}
                          data-testid={`button-edit-country-${country.id}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              data-testid={`button-delete-country-${country.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete Country
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "
                                {country.countryName}"? This action cannot be
                                undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  deleteCountryMutation.mutate(country.id)
                                }
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            {/* States Tab */}
            <TabsContent value="states">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">
                  States/Regions ({filteredStates.length})
                </h3>
                <Button
                  onClick={() => setShowStateForm(true)}
                  data-testid="button-add-state"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add State
                </Button>
              </div>

              {showStateForm && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Add New State/Region</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Form {...stateForm}>
                      <form
                        onSubmit={stateForm.handleSubmit((data) =>
                          createStateMutation.mutate(data),
                        )}
                        className="space-y-4"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={stateForm.control}
                            name="countryId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Country</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger data-testid="select-state-country">
                                      <SelectValue placeholder="Select a country" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {countries.map((country) => (
                                      <SelectItem
                                        key={country.id}
                                        value={country.id}
                                      >
                                        {country.countryName}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={stateForm.control}
                            name="stateCode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>State Code</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="CA, NY, TX..."
                                    {...field}
                                    data-testid="input-state-code"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={stateForm.control}
                            name="stateName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>State Name</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="California, New York..."
                                    {...field}
                                    data-testid="input-state-name"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={stateForm.control}
                            name="isActive"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">
                                    Active
                                  </FormLabel>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    data-testid="switch-state-active"
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowStateForm(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            disabled={createStateMutation.isPending}
                          >
                            {createStateMutation.isPending
                              ? "Creating..."
                              : "Create State"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-2">
                {loadingStates ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="animate-pulse h-12 bg-gray-200 rounded"
                      ></div>
                    ))}
                  </div>
                ) : (
                  filteredStates.map((state) => (
                    <div
                      key={state.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                      data-testid={`card-state-${state.id}`}
                    >
                      <div className="flex items-center space-x-4">
                        <Badge
                          variant={state.isActive ? "default" : "secondary"}
                        >
                          {state.stateCode}
                        </Badge>
                        <div>
                          <p className="font-medium">{state.stateName}</p>
                          <p className="text-sm text-muted-foreground">
                            {countries.find((c) => c.id === state.countryId)
                              ?.countryName || "Unknown Country"}{" "}
                            • {state.isActive ? "Active" : "Inactive"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingState(state)}
                          data-testid={`button-edit-state-${state.id}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              data-testid={`button-delete-state-${state.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete State</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "
                                {state.stateName}"? This action cannot be
                                undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  deleteStateMutation.mutate(state.id)
                                }
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Languages Tab */}
            <TabsContent value="languages">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">
                  Languages ({filteredLanguages.length})
                </h3>
                <Button
                  onClick={() => setShowLanguageForm(true)}
                  data-testid="button-add-language"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Language
                </Button>
              </div>

              {showLanguageForm && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Add New Language</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Form {...languageForm}>
                      <form
                        onSubmit={languageForm.handleSubmit((data) =>
                          createLanguageMutation.mutate(data),
                        )}
                        className="space-y-4"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={languageForm.control}
                            name="languageCode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Language Code</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="en, es, fr..."
                                    {...field}
                                    data-testid="input-language-code"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={languageForm.control}
                            name="languageName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Language Name</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="English, Spanish..."
                                    {...field}
                                    data-testid="input-language-name"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={languageForm.control}
                            name="isActive"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">
                                    Active
                                  </FormLabel>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    data-testid="switch-language-active"
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={languageForm.control}
                            name="isDefault"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">
                                    Default Language
                                  </FormLabel>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    data-testid="switch-language-default"
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowLanguageForm(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            disabled={createLanguageMutation.isPending}
                          >
                            {createLanguageMutation.isPending
                              ? "Creating..."
                              : "Create Language"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-2">
                {loadingLanguages ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="animate-pulse h-12 bg-gray-200 rounded"
                      ></div>
                    ))}
                  </div>
                ) : (
                  filteredLanguages.map((language) => (
                    <div
                      key={language.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                      data-testid={`card-language-${language.id}`}
                    >
                      <div className="flex items-center space-x-4">
                        <Badge
                          variant={language.isActive ? "default" : "secondary"}
                        >
                          {language.languageCode}
                        </Badge>
                        <div>
                          <p className="font-medium">{language.languageName}</p>
                          <p className="text-sm text-muted-foreground">
                            {language.isDefault ? "Default • " : ""}
                            {language.isActive ? "Active" : "Inactive"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingLanguage(language)}
                          data-testid={`button-edit-language-${language.id}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              data-testid={`button-delete-language-${language.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete Language
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "
                                {language.languageName}"? This action cannot be
                                undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  deleteLanguageMutation.mutate(language.id)
                                }
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
