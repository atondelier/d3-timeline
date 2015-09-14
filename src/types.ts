declare module d3Timeline {

    interface D3TableRow {
        id: string;
        name: string;
        elements: D3TableElement[]
    }

    interface D3TableElement {
        id: string|number;
        uid: string|number;
        start: number;
        end: number;
        row?: number;
        _defaultPrevented?: boolean;
        _removed?: boolean;
        _positioned?: boolean;
        _drag?: d3.behavior.Drag
    }

    interface D3TableOptions {
        bemBlockName?: string;
        bemBlockModifier?: string;
        xAxisHeight?: number;
        yAxisWidth?: number;
        rowHeight?: number;
        rowPadding?: number;
        padding?: number;
        tickPadding?: number;
        container?: string;
        cullingX?: boolean;
        cullingY?: boolean;
        cullingDistance?: number;
        renderOnIdle?: boolean;
        hideTicksOnZoom?: boolean;
        hideTicksOnDrag?: boolean;
        panYOnWheel?: boolean;
        wheelMultiplier?: number;
        enableYTransition?: boolean;
        enableTransitionOnExit?: boolean;
        usePreviousDataForTransform?: boolean;
        transitionEasing?: string;
        trackedDOMEvents?: string[];
        xAxisTicksFormatter?(d: any): string;
        xAxis2TicksFormatter?(d: any): string;
        yAxisFormatter?(d: any): string
        xAxisStrokeWidth?(d: any): number;
    }

    interface D3TableBlockOptions extends D3TableOptions {
        clipElement?: boolean;
        renderOnAutomaticScrollIdle?: boolean;
        hideTicksOnAutomaticScroll?: boolean;
        automaticScrollSpeedMultiplier?: number;
        automaticScrollMarginDelta?: number;
        appendText?: boolean;
        alignLeft?: boolean;
        alignOnTranslate?: boolean;
        maximumClickDragTime?: number;
        maximumClickDragDistance?: number;
        minimumDragDistance?: number;
        trackedElementDOMEvents?: string[];
        clipElementFilter?(selection: d3.Selection): boolean;
        xAxisTicksFormatter?(d: any): string;
        xAxis2TicksFormatter?(d: any): string;
        yAxisFormatter?(d: any): string
        xAxisStrokeWidth?(d: any): number;
    }

    interface D3TimelineOptions extends D3TableBlockOptions {
        minimumColumnWidth: number;
        minimumTimeInterval: number;
        availableTimeIntervals: number[];
        clipElementFilter?(selection: d3.Selection): boolean;
        xAxisTicksFormatter?(d: any): string;
        xAxis2TicksFormatter?(d: any): string;
        yAxisFormatter?(d: any): string
        xAxisStrokeWidth?(d: any): number;
    }

    interface D3TableMarkerOptions {
        formatter?(data: D3TableElement): string;
        insertionMethod: string;
        outerTickSize: number;
        tickPadding: number;
        roundPosition: boolean;
        bemBlockName: string;
        bemModifiers: string[];
        layout: 'horizontal'|'vertical';
        lineShape: 'line'|'rect';
        rectThickness: number;
    }

    interface D3TableMouseTrackerOptions extends D3TableMarkerOptions {
        listenToTouchEvents: boolean;
    }

}
