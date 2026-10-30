'use client';

import React from 'react';
import { RoleKey } from '@/config/roles';

// Import widget components
import {
  CheckinCounterWidget,
  CheckinQueueWidget,
  DuplicateResolutionWidget,
  WristbandIssuanceWidget,
  LateArrivalsWidget,
  QuickActionsWidget
} from './RegistrationWidgets';

import {
  BedOccupancyMatrixWidget,
  ExternalStayTrackerWidget,
  ContingentRoomingWidget,
  CheckinPipelineWidget,
  SpecialNeedsQueueWidget,
  RoomOverrideFormWidget,
  ApprovalRequestsWidget
} from './HospitalityWidgets';

import {
  ScheduleTimelineWidget,
  VenueStatusBoardWidget,
  ClashAlertFeedWidget,
  JudgeRosterWidget,
  EventDelayToolWidget,
  VolunteerDeploymentWidget
} from './EventsWidgets';

import {
  InventoryStatusWidget,
  EquipmentByVenueWidget,
  ShortagesAndClashesWidget,
  MoveRequestQueueWidget,
  DamageReportFormWidget
} from './LogisticsWidgets';

import {
  StockBySizeWidget,
  IssuanceStationWidget,
  DuplicateClaimDetectorWidget,
  SizeExchangeToolWidget,
  ContingentBulkPickupWidget
} from './MerchWidgets';

import {
  MealHeadcountForecastWidget,
  DietaryBreakdownWidget,
  VendorCapacityTrackerWidget,
  MealSlotMonitorWidget,
  IncidentLoggerWidget
} from './FoodWidgets';

import {
  MyShiftWidget,
  MyTasksWidget,
  VenueHeadcountReportWidget,
  ReportIncidentWidget,
  MealPassWidget
} from './VolunteerWidgets';

import {
  MasterKpiBarWidget,
  LiveIncidentCommandWidget,
  PendingApprovalsWidget,
  CrossDepartmentAlertsWidget,
  DirectorAlertsDrilldownWidget,
  FestivalTimelineHealthWidget
} from './DirectorWidgets';

interface WidgetRegistryProps {
  widgetId: string;
  role: RoleKey;
  onRefreshTrigger?: () => void;
}

export const WidgetRegistry: React.FC<WidgetRegistryProps> = ({
  widgetId,
  role,
  onRefreshTrigger
}) => {
  switch (widgetId) {
    // Registration
    case 'checkin_counter':
      return <CheckinCounterWidget role={role} onRefreshTrigger={onRefreshTrigger} />;
    case 'checkin_queue':
      return <CheckinQueueWidget role={role} onRefreshTrigger={onRefreshTrigger} />;
    case 'duplicate_resolution':
      return <DuplicateResolutionWidget role={role} onRefreshTrigger={onRefreshTrigger} />;
    case 'wristband_issuance':
      return <WristbandIssuanceWidget role={role} onRefreshTrigger={onRefreshTrigger} />;
    case 'late_arrivals':
      return <LateArrivalsWidget role={role} onRefreshTrigger={onRefreshTrigger} />;
    case 'quick_actions':
      return <QuickActionsWidget role={role} onRefreshTrigger={onRefreshTrigger} />;

    // Hospitality
    case 'bed_occupancy_matrix':
      return <BedOccupancyMatrixWidget role={role} onRefreshTrigger={onRefreshTrigger} />;
    case 'external_stay_tracker':
      return <ExternalStayTrackerWidget role={role} onRefreshTrigger={onRefreshTrigger} />;
    case 'contingent_rooming':
      return <ContingentRoomingWidget role={role} onRefreshTrigger={onRefreshTrigger} />;
    case 'checkin_pipeline':
      return <CheckinPipelineWidget role={role} onRefreshTrigger={onRefreshTrigger} />;
    case 'special_needs_queue':
      return <SpecialNeedsQueueWidget role={role} onRefreshTrigger={onRefreshTrigger} />;
    case 'room_override_form':
      return <RoomOverrideFormWidget role={role} onRefreshTrigger={onRefreshTrigger} />;
    case 'approval_requests':
      return <ApprovalRequestsWidget role={role} onRefreshTrigger={onRefreshTrigger} />;

    // Events
    case 'schedule_timeline':
      return <ScheduleTimelineWidget role={role} onRefreshTrigger={onRefreshTrigger} />;
    case 'venue_status_board':
      return <VenueStatusBoardWidget role={role} onRefreshTrigger={onRefreshTrigger} />;
    case 'clash_alert_feed':
      return <ClashAlertFeedWidget role={role} onRefreshTrigger={onRefreshTrigger} />;
    case 'judge_roster':
      return <JudgeRosterWidget role={role} onRefreshTrigger={onRefreshTrigger} />;
    case 'event_delay_tool':
      return <EventDelayToolWidget role={role} onRefreshTrigger={onRefreshTrigger} />;
    case 'volunteer_deployment':
      return <VolunteerDeploymentWidget role={role} onRefreshTrigger={onRefreshTrigger} />;

    // Logistics
    case 'inventory_status':
      return <InventoryStatusWidget role={role} onRefreshTrigger={onRefreshTrigger} />;
    case 'equipment_by_venue':
      return <EquipmentByVenueWidget role={role} onRefreshTrigger={onRefreshTrigger} />;
    case 'shortages_and_clashes':
      return <ShortagesAndClashesWidget role={role} onRefreshTrigger={onRefreshTrigger} />;
    case 'move_request_queue':
      return <MoveRequestQueueWidget role={role} onRefreshTrigger={onRefreshTrigger} />;
    case 'damage_report_form':
      return <DamageReportFormWidget role={role} onRefreshTrigger={onRefreshTrigger} />;

    // Merch
    case 'stock_by_size':
      return <StockBySizeWidget role={role} onRefreshTrigger={onRefreshTrigger} />;
    case 'issuance_station':
      return <IssuanceStationWidget role={role} onRefreshTrigger={onRefreshTrigger} />;
    case 'duplicate_claim_detector':
      return <DuplicateClaimDetectorWidget role={role} onRefreshTrigger={onRefreshTrigger} />;
    case 'size_exchange_tool':
      return <SizeExchangeToolWidget role={role} onRefreshTrigger={onRefreshTrigger} />;
    case 'contingent_bulk_pickup':
      return <ContingentBulkPickupWidget role={role} onRefreshTrigger={onRefreshTrigger} />;

    // Food
    case 'meal_headcount_forecast':
      return <MealHeadcountForecastWidget role={role} onRefreshTrigger={onRefreshTrigger} />;
    case 'dietary_breakdown':
      return <DietaryBreakdownWidget role={role} onRefreshTrigger={onRefreshTrigger} />;
    case 'vendor_capacity_tracker':
      return <VendorCapacityTrackerWidget role={role} onRefreshTrigger={onRefreshTrigger} />;
    case 'meal_slot_monitor':
      return <MealSlotMonitorWidget role={role} onRefreshTrigger={onRefreshTrigger} />;
    case 'incident_logger':
      return <IncidentLoggerWidget role={role} onRefreshTrigger={onRefreshTrigger} />;

    // Volunteer
    case 'my_shift':
      return <MyShiftWidget role={role} onRefreshTrigger={onRefreshTrigger} />;
    case 'my_tasks':
      return <MyTasksWidget role={role} onRefreshTrigger={onRefreshTrigger} />;
    case 'venue_headcount_report':
      return <VenueHeadcountReportWidget role={role} onRefreshTrigger={onRefreshTrigger} />;
    case 'report_incident':
      return <ReportIncidentWidget role={role} onRefreshTrigger={onRefreshTrigger} />;
    case 'meal_pass':
      return <MealPassWidget role={role} onRefreshTrigger={onRefreshTrigger} />;

    // Director
    case 'master_kpi_bar':
      return <MasterKpiBarWidget role={role} onRefreshTrigger={onRefreshTrigger} />;
    case 'live_incident_command':
      return <LiveIncidentCommandWidget role={role} onRefreshTrigger={onRefreshTrigger} />;
    case 'pending_approvals':
      return <PendingApprovalsWidget role={role} onRefreshTrigger={onRefreshTrigger} />;
    case 'cross_department_alerts':
      return <CrossDepartmentAlertsWidget role={role} onRefreshTrigger={onRefreshTrigger} />;
    case 'director_alerts_drilldown':
      return <DirectorAlertsDrilldownWidget role={role} onRefreshTrigger={onRefreshTrigger} />;
    case 'festival_timeline_health':
      return <FestivalTimelineHealthWidget role={role} onRefreshTrigger={onRefreshTrigger} />;

    default:
      return (
        <div className="p-4 rounded border border-red-200 bg-red-50 text-red-800 text-xs">
          Unregistered widget: {widgetId}
        </div>
      );
  }
};

