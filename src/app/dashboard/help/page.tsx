"use client";

import React, { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Search,
  HelpCircle,
  MessageCircle,
  Phone,
  Mail,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Send,
  FileText,
  Video,
  Headphones,
  Shield,
  MapPin,
  CreditCard,
  User,
  Settings,
  Smartphone,
  CheckCircle,
  Star,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  FormSection,
  FormGrid,
  InputField,
  SelectField,
  TextareaField,
} from "@/components/forms/FormField";
import { toast } from "@/components/ui/toast";
import { helpTicketSchema, type HelpTicketData } from "@/lib/validation/schemas";
import { cn } from "@/lib/utils";

// FAQ Categories and data
const faqCategories = [
  { id: "account", label: "Account & Profiel", icon: User },
  { id: "jobs", label: "Opdrachten", icon: FileText },
  { id: "gps", label: "GPS & Locatie", icon: MapPin },
  { id: "payments", label: "Betalingen", icon: CreditCard },
  { id: "app", label: "App & Technisch", icon: Smartphone },
  { id: "security", label: "Beveiliging", icon: Shield },
];

const faqData = [
  {
    id: "1",
    category: "account",
    question: "Hoe kan ik mijn profiel aanpassen?",
    answer: "Ga naar Instellingen > Account om je persoonlijke gegevens, profielfoto en specialisaties aan te passen. Zorg ervoor dat je profiel volledig en up-to-date is voor betere opdracht matches.",
    helpful: 24,
    notHelpful: 2,
  },
  {
    id: "2",
    category: "account",
    question: "Waarom wordt mijn account niet geverifieerd?",
    answer: "Account verificatie kan 1-3 werkdagen duren. Zorg ervoor dat je alle vereiste documenten hebt geüpload: geldig ID, KvK uittreksel en WPBR certificaat. Bij vragen neem contact op met support.",
    helpful: 18,
    notHelpful: 1,
  },
  {
    id: "3",
    category: "jobs",
    question: "Hoe solliciteer ik op een opdracht?",
    answer: "Open de opdracht details en klik op 'Solliciteren'. Je kunt kiezen voor snelle sollicitatie of uitgebreide sollicitatie met motivatie. Bij urgente opdrachten kun je direct geaccepteerd worden.",
    helpful: 42,
    notHelpful: 0,
  },
  {
    id: "4",
    category: "jobs",
    question: "Kan ik een sollicitatie intrekken?",
    answer: "Ja, zolang je sollicitatie nog niet geaccepteerd is kun je deze intrekken via je sollicitaties overzicht. Let op: te vaak intrekken kan je reputatie beïnvloeden.",
    helpful: 15,
    notHelpful: 3,
  },
  {
    id: "5",
    category: "gps",
    question: "Waarom werkt GPS niet op mijn telefoon?",
    answer: "Controleer of je locatieservices hebt ingeschakeld voor SecuryFlex. Ga naar je telefoon instellingen > Privacy > Locatieservices en zorg dat SecuryFlex 'Altijd' toegang heeft.",
    helpful: 31,
    notHelpful: 4,
  },
  {
    id: "6",
    category: "gps",
    question: "Hoe nauwkeurig moet mijn GPS zijn?",
    answer: "Voor clock-in/out is een nauwkeurigheid van maximaal 100 meter vereist. Bij slechte GPS ontvangst probeer buiten te gaan staan of wacht even tot het signaal verbetert.",
    helpful: 28,
    notHelpful: 2,
  },
  {
    id: "7",
    category: "payments",
    question: "Wanneer krijg ik mijn betaling?",
    answer: "Standaard betalingen worden binnen 7 dagen verwerkt na goedkeuring van je werkuren. Met Finqle Direct Payment ontvang je betaling binnen 24 uur (kleine toeslag van toepassing).",
    helpful: 56,
    notHelpful: 1,
  },
  {
    id: "8",
    category: "payments",
    question: "Hoe werkt Finqle Direct Payment?",
    answer: "Finqle Direct Payment is onze snelle betalingsservice. Voor €2,99 per opdracht ontvang je je salaris binnen 24 uur na goedkeuring werkuren. Perfect voor urgente betalingen.",
    helpful: 22,
    notHelpful: 5,
  },
  {
    id: "9",
    category: "app",
    question: "De app crasht steeds, wat nu?",
    answer: "Probeer eerst de app opnieuw op te starten. Werkt dit niet? Update naar de laatste versie via de App Store. Blijft het probleem? Neem contact op met support met je telefoonmodel en iOS/Android versie.",
    helpful: 19,
    notHelpful: 2,
  },
  {
    id: "10",
    category: "security",
    question: "Is mijn persoonlijke informatie veilig?",
    answer: "Ja, we nemen privacy en veiligheid zeer serieus. Al je gegevens worden versleuteld opgeslagen en we volgen GDPR richtlijnen. Je kunt je privacy instellingen aanpassen in Instellingen > Privacy.",
    helpful: 33,
    notHelpful: 0,
  },
];

// Support contact options
const supportOptions = [
  {
    title: "Live Chat",
    description: "Chat direct met onze support (ma-vr 9-17)",
    icon: MessageCircle,
    action: "Start Chat",
    available: true,
    responseTime: "< 5 min",
  },
  {
    title: "Telefoon Support",
    description: "Bel ons voor directe hulp",
    icon: Phone,
    action: "085 - 130 8090",
    available: true,
    responseTime: "Direct",
  },
  {
    title: "E-mail Support",
    description: "Stuur ons een gedetailleerd bericht",
    icon: Mail,
    action: "support@securyflex.nl",
    available: true,
    responseTime: "< 4 uur",
  },
  {
    title: "Noodlijn",
    description: "24/7 beschikbaar voor noodsituaties",
    icon: AlertTriangle,
    action: "112 of 085 - 130 8099",
    available: true,
    responseTime: "Direct",
    urgent: true,
  },
];

// Help resources
const helpResources = [
  {
    title: "Video Tutorials",
    description: "Leer SecuryFlex kennen met onze video guides",
    icon: Video,
    count: 12,
    url: "/help/videos",
  },
  {
    title: "Gebruikershandleiding",
    description: "Uitgebreide handleiding voor alle functies",
    icon: FileText,
    count: 1,
    url: "/help/manual",
  },
  {
    title: "Webinars",
    description: "Live training sessies voor beveiligers",
    icon: Headphones,
    count: 8,
    url: "/help/webinars",
  },
];

export default function HelpPage() {
  const [activeTab, setActiveTab] = useState("faq");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [openFaqItems, setOpenFaqItems] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const methods = useForm<HelpTicketData>({
    resolver: zodResolver(helpTicketSchema),
    defaultValues: {
      onderwerp: "",
      categorie: "TECHNISCH",
      prioriteit: "NORMAAL",
      beschrijving: "",
    },
  });

  const { handleSubmit, reset } = methods;

  // Filter FAQs based on search and category
  const filteredFaqs = faqData.filter((faq) => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFaqItem = (id: string) => {
    setOpenFaqItems(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleFeedback = (faqId: string, helpful: boolean) => {
    toast.success(helpful ? "Bedankt voor je feedback!" : "We zullen dit verbeteren");
  };

  const onSubmitTicket = async (data: HelpTicketData) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log("Support ticket:", data);
      toast.success("Support ticket aangemaakt! We nemen binnen 4 uur contact op.");
      reset();
    } catch (error) {
      toast.error("Fout bij aanmaken ticket. Probeer opnieuw.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout
      title="Help & Support"
      subtitle="Vind antwoorden of neem contact op"
    >
      <div className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="faq" className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              <span className="hidden sm:inline">FAQ</span>
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Contact</span>
            </TabsTrigger>
            <TabsTrigger value="ticket" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Ticket</span>
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Resources</span>
            </TabsTrigger>
          </TabsList>

          {/* FAQ Tab */}
          <TabsContent value="faq" className="space-y-6">
            {/* Search and Filters */}
            <Card className="p-4">
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Zoek in veelgestelde vragen..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedCategory === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory("all")}
                  >
                    Alle categorieën
                  </Button>
                  {faqCategories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <Button
                        key={category.id}
                        variant={selectedCategory === category.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(category.id)}
                        className="flex items-center gap-2"
                      >
                        <Icon className="h-3 w-3" />
                        {category.label}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </Card>

            {/* FAQ List */}
            <div className="space-y-3">
              {filteredFaqs.length === 0 ? (
                <Card className="p-8 text-center">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Geen resultaten gevonden</h3>
                  <p className="text-muted-foreground mb-4">
                    Probeer een andere zoekterm of categorie.
                  </p>
                  <Button variant="outline" onClick={() => setActiveTab("contact")}>
                    Neem contact op
                  </Button>
                </Card>
              ) : (
                filteredFaqs.map((faq) => {
                  const isOpen = openFaqItems.includes(faq.id);
                  const categoryData = faqCategories.find(c => c.id === faq.category);
                  const CategoryIcon = categoryData?.icon || HelpCircle;

                  return (
                    <Card key={faq.id} className="overflow-hidden">
                      <Collapsible open={isOpen} onOpenChange={() => toggleFaqItem(faq.id)}>
                        <CollapsibleTrigger asChild>
                          <div className="p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1">
                                <CategoryIcon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                <h3 className="font-medium text-left">{faq.question}</h3>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-xs">
                                  {categoryData?.label}
                                </Badge>
                                {isOpen ? (
                                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                )}
                              </div>
                            </div>
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="px-4 pb-4">
                            <Separator className="mb-4" />
                            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                              {faq.answer}
                            </p>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <span className="text-xs text-muted-foreground">
                                  Was dit nuttig?
                                </span>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleFeedback(faq.id, true)}
                                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                  >
                                    <ThumbsUp className="h-3 w-3 mr-1" />
                                    {faq.helpful}
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleFeedback(faq.id, false)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <ThumbsDown className="h-3 w-3 mr-1" />
                                    {faq.notHelpful}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>

          {/* Contact Tab */}
          <TabsContent value="contact" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {supportOptions.map((option, index) => {
                const Icon = option.icon;
                return (
                  <Card key={index} className={cn(
                    "p-6 hover:shadow-md transition-shadow",
                    option.urgent && "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
                  )}>
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "p-3 rounded-full",
                        option.urgent
                          ? "bg-red-100 dark:bg-red-900/40"
                          : "bg-primary/10"
                      )}>
                        <Icon className={cn(
                          "h-6 w-6",
                          option.urgent ? "text-red-600" : "text-primary"
                        )} />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{option.title}</h3>
                          {option.available && (
                            <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-xs">
                              <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse" />
                              Online
                            </Badge>
                          )}
                        </div>

                        <p className="text-sm text-muted-foreground mb-3">
                          {option.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            Response: {option.responseTime}
                          </span>
                          <Button
                            size="sm"
                            variant={option.urgent ? "destructive" : "default"}
                          >
                            {option.action}
                            <ExternalLink className="h-3 w-3 ml-2" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Emergency Warning */}
            <Card className="p-6 border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-6 w-6 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">
                    Noodsituatie tijdens je shift?
                  </h3>
                  <p className="text-sm text-orange-700 dark:text-orange-300 mb-3">
                    Bij acute noodsituaties bel altijd eerst 112. Meld vervolgens het incident via onze noodlijn.
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="destructive">
                      <Phone className="h-3 w-3 mr-2" />
                      112 (Spoed)
                    </Button>
                    <Button size="sm" variant="outline">
                      <Phone className="h-3 w-3 mr-2" />
                      085 - 130 8099 (SecuryFlex)
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Support Ticket Tab */}
          <TabsContent value="ticket" className="space-y-6">
            <Card className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Support Ticket Aanmaken</h3>
                <p className="text-sm text-muted-foreground">
                  Beschrijf je probleem zo gedetailleerd mogelijk. We nemen binnen 4 uur contact op.
                </p>
              </div>

              <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmitTicket)} className="space-y-6">
                  <FormSection title="Ticket Details">
                    <FormGrid columns={2}>
                      <SelectField
                        name="categorie"
                        label="Categorie"
                        required
                        options={[
                          { value: "TECHNISCH", label: "Technisch probleem" },
                          { value: "ACCOUNT", label: "Account & Profiel" },
                          { value: "BETALING", label: "Betalingen" },
                          { value: "OPDRACHT", label: "Opdrachten & Shifts" },
                          { value: "ANDERS", label: "Anders" },
                        ]}
                      />
                      <SelectField
                        name="prioriteit"
                        label="Prioriteit"
                        required
                        options={[
                          { value: "LAAG", label: "Laag - Algemene vraag" },
                          { value: "NORMAAL", label: "Normaal - Standaard probleem" },
                          { value: "HOOG", label: "Hoog - Urgent probleem" },
                          { value: "URGENT", label: "Urgent - Blokkeert werk" },
                        ]}
                      />
                    </FormGrid>

                    <InputField
                      name="onderwerp"
                      label="Onderwerp"
                      placeholder="Korte samenvatting van je probleem"
                      required
                    />

                    <TextareaField
                      name="beschrijving"
                      label="Beschrijving"
                      placeholder="Beschrijf je probleem zo gedetailleerd mogelijk. Vermeld wanneer het probleem optreedt, welke stappen je hebt ondernomen, en wat je verwacht had dat er zou gebeuren."
                      rows={6}
                      maxLength={1000}
                      required
                    />
                  </FormSection>

                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1"
                    >
                      {isSubmitting ? (
                        <>
                          <Clock className="h-4 w-4 mr-2 animate-spin" />
                          Verzenden...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Ticket Aanmaken
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => reset()}
                    >
                      Wissen
                    </Button>
                  </div>
                </form>
              </FormProvider>
            </Card>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {helpResources.map((resource, index) => {
                const Icon = resource.icon;
                return (
                  <Card key={index} className="p-6 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                        <Icon className="h-8 w-8 text-primary" />
                      </div>

                      <div>
                        <h3 className="font-semibold mb-2">{resource.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          {resource.description}
                        </p>
                        <Badge variant="secondary" className="text-xs">
                          {resource.count} items
                        </Badge>
                      </div>

                      <Button variant="outline" size="sm" className="w-full">
                        Bekijken
                        <ExternalLink className="h-3 w-3 ml-2" />
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Quick Links */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Snelle Links</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button variant="outline" className="justify-start">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Hoe werkt GPS check-in?
                </Button>
                <Button variant="outline" className="justify-start">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Betalingen uitgelegd
                </Button>
                <Button variant="outline" className="justify-start">
                  <Shield className="h-4 w-4 mr-2" />
                  Veiligheid & Privacy
                </Button>
                <Button variant="outline" className="justify-start">
                  <Star className="h-4 w-4 mr-2" />
                  Tips voor meer opdrachten
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}