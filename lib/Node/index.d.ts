import React, { SyntheticEvent } from 'react';
import { HierarchyPointNode } from 'd3-hierarchy';
import { Orientation, Point, TreeNodeDatum, RawNodeDatum, RenderCustomNodeElementFn } from '../types/common';
declare type NodeEventHandler = (hierarchyPointNode: HierarchyPointNode<TreeNodeDatum>, evt: SyntheticEvent) => void;
declare type NodeProps = {
    data: TreeNodeDatum;
    position: Point;
    hierarchyPointNode: HierarchyPointNode<TreeNodeDatum>;
    parent: HierarchyPointNode<TreeNodeDatum> | null;
    nodeClassName: string;
    nodeSize: {
        x: number;
        y: number;
    };
    orientation: Orientation;
    enableLegacyTransitions: boolean;
    transitionDuration: number;
    renderCustomNodeElement: RenderCustomNodeElementFn;
    onNodeToggle: (nodeId: string) => void;
    onNodeClick: NodeEventHandler;
    onNodeMouseOver: NodeEventHandler;
    onNodeMouseOut: NodeEventHandler;
    subscriptions: object;
    centerNode: (hierarchyPointNode: HierarchyPointNode<TreeNodeDatum>) => void;
    handleAddChildrenToNode: (nodeId: string, children: RawNodeDatum[]) => void;
};
declare type NodeState = {
    transform: string;
    initialStyle: {
        opacity: number;
    };
    wasClicked: boolean;
};
export default class Node extends React.Component<NodeProps, NodeState> {
    private nodeRef;
    state: {
        transform: string;
        initialStyle: {
            opacity: number;
        };
        wasClicked: boolean;
    };
    componentDidMount(): void;
    componentDidUpdate(): void;
    shouldComponentUpdate(nextProps: NodeProps): boolean;
    shouldNodeTransform: (ownProps: NodeProps, nextProps: NodeProps) => boolean;
    setTransform(position: NodeProps['position'], parent: NodeProps['parent'], orientation: NodeProps['orientation'], shouldTranslateToOrigin?: boolean): string;
    applyTransform(transform: string, transitionDuration: NodeProps['transitionDuration'], opacity?: number, done?: () => void): void;
    commitTransform(): void;
    renderNodeElement: () => JSX.Element;
    handleNodeToggle: () => void;
    handleOnClick: (evt: any) => void;
    handleOnMouseOver: (evt: any) => void;
    handleOnMouseOut: (evt: any) => void;
    handleAddChildren: (childrenData: any) => void;
    componentWillLeave(done: any): void;
    render(): JSX.Element;
}
export {};
