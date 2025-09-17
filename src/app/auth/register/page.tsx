"use client";

import Link from "next/link";
import Image from "next/image";
import { Shield, Building2, Factory, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl p-8 shadow-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <Image
              src="/logo-website-securyflex.svg"
              alt="SecuryFlex"
              width={280}
              height={84}
              className="h-20 w-auto mx-auto mb-4"
              priority
            />
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Account aanmaken</h1>
          <p className="text-muted-foreground mt-2">
            Kies je rol om te beginnen met SecuryFlex
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* ZZP Beveiliger Card */}
          <Link href="/auth/register/beveiliger">
            <div className="group cursor-pointer bg-white rounded-xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/20 h-full flex flex-col">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Shield className="h-10 w-10 text-primary" />
                </div>
              </div>

              <h3 className="text-lg font-bold mb-3 text-center">ZZP Beveiliger</h3>

              <div className="space-y-3 mb-6 flex-grow">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-muted-foreground">Verdien €28+ per uur</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-muted-foreground">Kies je eigen werktijden</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-muted-foreground">Betaald binnen 24 uur</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-muted-foreground">Automatische facturatie</span>
                </div>
              </div>

              <div className="text-center">
                <span className="text-primary font-medium group-hover:underline inline-flex items-center">
                  Start als beveiliger
                  <ArrowRight className="h-4 w-4 ml-2" />
                </span>
              </div>
            </div>
          </Link>

          {/* Beveiligingsbedrijf Card */}
          <Link href="/auth/register/bedrijf">
            <div className="group cursor-pointer bg-white rounded-xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/20 h-full flex flex-col">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Building2 className="h-10 w-10 text-primary" />
                </div>
              </div>

              <h3 className="text-lg font-bold mb-3 text-center w-full -ml-2">Beveiligingsbedrijf</h3>

              <div className="space-y-3 mb-6 flex-grow">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-muted-foreground">Toegang tot 2.847+ beveiligers</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-muted-foreground">Automatische planning</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-muted-foreground">Real-time GPS monitoring</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-muted-foreground">Win meer opdrachten</span>
                </div>
              </div>

              <div className="text-center">
                <span className="text-primary font-medium group-hover:underline inline-flex items-center">
                  Start als bedrijf
                  <ArrowRight className="h-4 w-4 ml-2" />
                </span>
              </div>
            </div>
          </Link>

          {/* Opdrachtgever Card */}
          <Link href="/auth/register/opdrachtgever">
            <div className="group cursor-pointer bg-white rounded-xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/20 h-full flex flex-col">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Factory className="h-10 w-10 text-primary" />
                </div>
              </div>

              <h3 className="text-lg font-bold mb-3 text-center">Opdrachtgever</h3>

              <div className="space-y-3 mb-6 flex-grow">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-muted-foreground">Beveiliging binnen 5 minuten</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-muted-foreground">Transparante prijzen</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-muted-foreground">Live GPS tracking</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-muted-foreground">Betaal achteraf</span>
                </div>
              </div>

              <div className="text-center">
                <span className="text-primary font-medium group-hover:underline inline-flex items-center">
                  Start als opdrachtgever
                  <ArrowRight className="h-4 w-4 ml-2" />
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Already have account */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Heb je al een account?{" "}
            <Link
              href="/auth/login"
              className="font-medium text-primary hover:underline"
            >
              Log hier in
            </Link>
          </p>
        </div>

        {/* Trust signals */}
        <div className="mt-8 pt-8 border-t">
          <div className="flex justify-center items-center space-x-8 text-xs text-muted-foreground">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>WPBR gecertificeerd</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>SSL beveiligd</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>GDPR compliant</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}