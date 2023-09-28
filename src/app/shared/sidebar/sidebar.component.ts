import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout";
import { FlatTreeControl } from "@angular/cdk/tree";
import { Component, Input, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatTreeFlatDataSource, MatTreeFlattener } from "@angular/material/tree";
import { NavigationEnd, Router } from "@angular/router";
import { Observable, ReplaySubject } from "rxjs";
import { map, shareReplay, takeUntil } from 'rxjs/operators';
interface SidebarNode {
    name: string;
    link?: string;
    hiddenLink?: string[]; // This will hold links of the pages which are not directly accessible.
    openActiveMenu?: boolean;
    children?: SidebarNode[];
}
/** Flat node with expandable and level information */
interface SidebarFlatNode {
    expandable: boolean;
    name: string;
    level: number;
    link?: string;
    openActiveMenu?: boolean;
    hiddenLink?: string[];
}
@Component({
    selector: "sidebar",
    templateUrl: "sidebar.component.html",
    styleUrls: ["sidebar.component.scss"]
})
export class SidebarComponent implements OnInit, OnDestroy {
    /*--- hide-show-password ----*/
    public hide = true;
    /** Instance of mat dialog */
    @ViewChild('changepassword', { static: true }) public changepassword: any;
        /** Instance of modal */
        public modalDialogRef: any;
    /** Holds current page url */
    private currentUrl: string = "";
    /** Observable to unsubscribe all the store listeners to avoid memory leaks */
    public destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
    /** Holds transformer data */
    public transformer = (node: SidebarNode, level: number) => ({
        expandable: !!node.children && node.children.length > 0,
        name: node.name,
        level: level,
        link: node.link,
        openActiveMenu: node?.openActiveMenu,
        hiddenLink: node?.hiddenLink
    });
    /** Holds treeControl data */
    public treeControl = new FlatTreeControl<SidebarFlatNode>(
        node => node.level,
        node => node.expandable,
    );
    /** Holds treeFlattener data */
    public treeFlattener = new MatTreeFlattener<SidebarNode, SidebarFlatNode>(
        this.transformer,
        node => node.level,
        node => node.expandable,
        node => node.children,
    );
    /** Holds dataSource data */
    public dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
    /** Holds tree data has child */
    public hasChild = (_: number, node: SidebarFlatNode) => node.expandable;
    public isExpanded = true;
    public isMobile$: Observable<boolean>;
    constructor(
        private router: Router,
        public breakpointObserver: BreakpointObserver,
        public dialog: MatDialog
    ) {
        this.isMobile$ = this.breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small])
        .pipe(
          map(result => result.matches),
          shareReplay()
        );
        this.dataSource.data = [
            {
                name: 'Sync',
                children: [
                    { name: 'Shopify to Giddh', openActiveMenu: true, hiddenLink: ['/connect'] }
                ],
            },
            {
                name: 'Mapping',
                children:
                    [
                        { name: 'Unit Mapping', hiddenLink: ['/mapping/unit-mapping'] },
                        { name: 'Shopify to Giddh', hiddenLink: ['/mapping/welcome'] },
                        { name: 'Other', hiddenLink: ['/mapping/other'] }
                    ],
            },
            {
                name: 'Logs',
                children: [
                    { name: 'Failed Logs', hiddenLink: ['logs/failed-log'] },
                    { name: 'Settings', hiddenLink: ['logs/setting'] }
                ],
            },
            {
                name: 'Faq',
                link: '/faq',
            }
        ];
    }
    /**
     * Initializes the component
     */
    ngOnInit(): void {
        this.currentUrl = this.router.url;
        this.router.events.pipe(takeUntil(this.destroyed$)).subscribe(event => {
            if (event instanceof NavigationEnd) {
                this.currentUrl = event.url;
                this.openActiveMenu(this.currentUrl);
            }
        });
    }
    /*---- open dialog change password ----*/
    public openChangePassword(): void {
        this.modalDialogRef = this.dialog.open(this.changepassword, {
            width: '600px'
        });
    }

    // const isSmallScreen = breakpointObserver.isMatched('(max-width: 599px)');

    public toggleMenu() {
        this.isExpanded = !this.isExpanded;
    }
    /**
     * Cleans up resources when the component is destroyed
     */
    ngOnDestroy(): void {
        this.destroyed$.next(true);
        this.destroyed$.complete();
    }
    /**
     * Open the active menu based on the current URL
     * @param url The current URL
     */
    public openActiveMenu(url: string): void {
        let activeNodeIndex: number | null = null;
        console.log(this.dataSource.data)
        this.dataSource.data?.forEach((tree, index) => {
            if (activeNodeIndex === null) {
                let activeNode = tree?.children?.filter(node => node?.link === url || node?.hiddenLink?.includes(url));

                if (activeNode?.length) {
                    activeNodeIndex = index;
                }
            }
        });
        let rootLevelNodes = this.treeControl.dataNodes?.filter(node => node.level === 0);
        if (activeNodeIndex !== null) {
            this.treeControl.expand(rootLevelNodes[activeNodeIndex]);
        }
    }
}
