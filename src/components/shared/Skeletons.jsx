import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Basic skeleton utilities
const SkeletonLine = ({ width = "100%", height = "h-4", className = "" }) => (
  <div className={`bg-slate-200 rounded animate-pulse ${height} ${className}`} style={{ width }} />
);

const SkeletonCircle = ({ size = "w-8 h-8", className = "" }) => (
  <div className={`bg-slate-200 rounded-full animate-pulse ${size} ${className}`} />
);

// Card skeleton for general use
export function CardSkeleton({ lines = 3, showAvatar = false }) {
  return (
    <Card className="animate-pulse">
      <CardHeader>
        <div className="flex items-center gap-4">
          {showAvatar && <SkeletonCircle size="w-12 h-12" />}
          <div className="space-y-2 flex-1">
            <SkeletonLine width="60%" height="h-5" />
            <SkeletonLine width="40%" height="h-3" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {Array(lines).fill(0).map((_, i) => (
          <SkeletonLine key={i} width={`${85 - i * 10}%`} />
        ))}
      </CardContent>
    </Card>
  );
}

// Table skeleton with realistic structure
export function TableSkeleton({ rows = 5, columns = 4, hasActions = true }) {
  return (
    <div className="rounded-md border animate-pulse">
      <Table>
        <TableHeader>
          <TableRow>
            {Array(columns).fill(0).map((_, i) => (
              <TableHead key={i}>
                <SkeletonLine height="h-4" width="80%" />
              </TableHead>
            ))}
            {hasActions && (
              <TableHead className="w-24">
                <SkeletonLine height="h-4" width="60%" />
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array(rows).fill(0).map((_, rowIndex) => (
            <TableRow key={rowIndex}>
              {Array(columns).fill(0).map((_, colIndex) => (
                <TableCell key={colIndex}>
                  <SkeletonLine height="h-4" width={`${70 + Math.random() * 20}%`} />
                </TableCell>
              ))}
              {hasActions && (
                <TableCell>
                  <div className="flex gap-2">
                    <SkeletonCircle size="w-8 h-8" />
                    <SkeletonCircle size="w-8 h-8" />
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// Page skeleton for full page layouts
export function PageSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <SkeletonLine height="h-8" width="300px" />
          <SkeletonLine height="h-4" width="500px" />
        </div>
        <SkeletonLine height="h-10" width="120px" />
      </div>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array(4).fill(0).map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg border">
            <div className="flex items-center justify-between mb-4">
              <SkeletonLine height="h-4" width="60%" />
              <SkeletonCircle size="w-6 h-6" />
            </div>
            <SkeletonLine height="h-8" width="40%" className="mb-2" />
            <SkeletonLine height="h-3" width="80%" />
          </div>
        ))}
      </div>
      
      {/* Main content area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border p-6">
            <SkeletonLine height="h-6" width="200px" className="mb-4" />
            <SkeletonLine height="h-64" width="100%" />
          </div>
        </div>
        <div className="space-y-4">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-lg border p-4">
              <SkeletonLine height="h-5" width="70%" className="mb-3" />
              <div className="space-y-2">
                <SkeletonLine width="100%" />
                <SkeletonLine width="85%" />
                <SkeletonLine width="60%" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// List skeleton for items in a list
export function ListSkeleton({ items = 5, showImage = false }) {
  return (
    <div className="space-y-4">
      {Array(items).fill(0).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 bg-white rounded-lg border">
          {showImage && <SkeletonCircle size="w-16 h-16" />}
          <div className="flex-1 space-y-2">
            <SkeletonLine height="h-5" width="60%" />
            <SkeletonLine height="h-4" width="80%" />
            <SkeletonLine height="h-3" width="40%" />
          </div>
          <div className="space-y-2">
            <SkeletonLine height="h-4" width="60px" />
            <SkeletonCircle size="w-6 h-6" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Dashboard specific skeleton
export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <SkeletonLine height="h-8" width="300px" className="mb-2" />
          <SkeletonLine height="h-4" width="400px" />
        </div>
        <div className="flex gap-3">
          <SkeletonLine height="h-10" width="100px" />
          <SkeletonLine height="h-10" width="100px" />
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array(4).fill(0).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <SkeletonLine width="60%" height="h-4" />
                <SkeletonCircle size="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <SkeletonLine width="40%" height="h-8" className="mb-2" />
              <SkeletonLine width="70%" height="h-3" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {Array(2).fill(0).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <SkeletonLine width="40%" height="h-6" />
            </CardHeader>
            <CardContent>
              <SkeletonLine width="100%" height="h-64" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}