"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { mainNav } from "@/config/site"
import { cn } from "@/lib/utils"
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Building, Menu } from "lucide-react" // Placeholder for logo

const AppLogo = () => (
  <Link href="/dashboard" className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
    <Building className="h-7 w-7 text-primary group-data-[collapsible=icon]:h-6 group-data-[collapsible=icon]:w-6" />
    <span className="font-bold text-lg text-primary group-data-[collapsible=icon]:hidden">
      QuoteFlow
    </span>
  </Link>
)

export function AppSidebar() {
  const pathname = usePathname()
  const { state, isMobile, setOpenMobile } = useSidebar()
  const isCollapsed = state === "collapsed" && !isMobile

  return (
    <Sidebar
      variant="sidebar"
      collapsible={isMobile ? "offcanvas" : "icon"}
      className={cn(
        "border-r border-sidebar-border transition-all duration-300 ease-in-out",
        isMobile && "bg-background"
      )}
    >
      <SidebarHeader className="p-4 flex items-center justify-between">
        <AppLogo />
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={() => setOpenMobile(false)}>
            <Menu className="h-6 w-6" />
          </Button>
        )}
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent asChild>
        <ScrollArea className="h-full">
          <SidebarMenu className="p-4 space-y-1">
            {mainNav.map((group, index) => (
              <React.Fragment key={index}>
                {group.title && !isCollapsed && (
                  <h4 className="px-2 py-1 text-sm font-semibold text-muted-foreground">
                    {group.title}
                  </h4>
                )}
                {group.items.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
                  return (
                    <SidebarMenuItem key={item.href}>
                      <Link href={item.href} legacyBehavior passHref>
                        <SidebarMenuButton
                          variant="default"
                          size="default"
                          isActive={isActive}
                          className={cn(
                            "w-full justify-start",
                            isActive && "bg-primary/10 text-primary hover:bg-primary/20",
                            !isActive && "hover:bg-accent/50"
                          )}
                          tooltip={isCollapsed ? item.title : undefined}
                        >
                          {Icon && <Icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary")} />}
                          <span className={cn(isCollapsed && "sr-only")}>
                            {item.title}
                          </span>
                        </SidebarMenuButton>
                      </Link>
                    </SidebarMenuItem>
                  )
                })}
              </React.Fragment>
            ))}
          </SidebarMenu>
        </ScrollArea>
      </SidebarContent>
      {!isMobile && (
         <SidebarFooter className="p-4 mt-auto">
          {/* Can add user info or settings shortcut here */}
         </SidebarFooter>
      )}
    </Sidebar>
  )
}

// Minimal React import
import React from "react";
