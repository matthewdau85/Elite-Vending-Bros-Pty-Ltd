
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, Package, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function ProductAffinity({ affinities = [], products = [], isLoading, onGenerate }) {

  const getProductInfo = (sku) => {
    return products.find(p => p.sku === sku);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array(3).fill(0).map((_, i) => (
          <Card key={i}><CardContent className="p-6"><Skeleton className="h-24 w-full" /></CardContent></Card>
        ))}
      </div>
    );
  }

  if (affinities.length === 0) {
    return (
      <div className="text-center py-12">
        <Link className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-slate-900 mb-2">Product Affinity Analysis</h3>
        <p className="text-slate-500 mb-6">
          Discover which products are frequently bought together.
        </p>
        <Button onClick={onGenerate}>
          <Sparkles className="w-4 h-4 mr-2" />
          Analyze Product Affinity
        </Button>
      </div>
    );
  }

  return (
    <div>
      <CardHeader className="px-0 mb-4">
        <CardTitle>Product Affinity Analysis</CardTitle>
        <CardDescription>Products frequently purchased in the same transaction.</CardDescription>
      </CardHeader>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {affinities.map((affinity, index) => {
          const productA = getProductInfo(affinity.product_pair[0]);
          const productB = getProductInfo(affinity.product_pair[1]);

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-all h-full">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-center gap-4">
                    <div className="text-center">
                      <Package className="w-10 h-10 mx-auto text-purple-500 mb-2"/>
                      <p className="font-semibold text-sm">{productA?.name || affinity.product_pair[0]}</p>
                    </div>
                    <Link className="w-8 h-8 text-slate-400 shrink-0"/>
                    <div className="text-center">
                      <Package className="w-10 h-10 mx-auto text-blue-500 mb-2"/>
                      <p className="font-semibold text-sm">{productB?.name || affinity.product_pair[1]}</p>
                    </div>
                  </div>
                  <div className="text-center pt-4 border-t">
                    <p className="text-sm text-slate-600">{affinity.insight}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
