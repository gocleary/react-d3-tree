"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var d3_hierarchy_1 = require("d3-hierarchy");
var d3_selection_1 = require("d3-selection");
var d3_zoom_1 = require("d3-zoom");
var lite_1 = require("dequal/lite");
var clone_1 = __importDefault(require("clone"));
var uuid_1 = require("uuid");
var TransitionGroupWrapper_1 = __importDefault(require("./TransitionGroupWrapper"));
var Node_1 = __importDefault(require("../Node"));
var Link_1 = __importDefault(require("../Link"));
var globalCss_1 = __importDefault(require("../globalCss"));
var Tree = /** @class */ (function (_super) {
    __extends(Tree, _super);
    function Tree() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            dataRef: _this.props.data,
            data: Tree.assignInternalProperties(clone_1.default(_this.props.data)),
            d3: Tree.calculateD3Geometry(_this.props),
            isTransitioning: false,
            isInitialRenderForDataset: true,
            dataKey: _this.props.dataKey,
        };
        _this.internalState = {
            targetNode: null,
            isTransitioning: false,
        };
        _this.svgInstanceRef = "rd3t-svg-" + uuid_1.v4();
        _this.gInstanceRef = "rd3t-g-" + uuid_1.v4();
        /**
         * Finds the node matching `nodeId` and
         * expands/collapses it, depending on the current state of
         * its internal `collapsed` property.
         * `setState` callback receives targetNode and handles
         * `props.onClick` if defined.
         */
        _this.handleNodeToggle = function (nodeId) {
            var data = clone_1.default(_this.state.data);
            var matches = _this.findNodesById(nodeId, data, []);
            var targetNodeDatum = matches[0];
            if (_this.props.collapsible && !_this.state.isTransitioning) {
                if (targetNodeDatum.__rd3t.collapsed) {
                    Tree.expandNode(targetNodeDatum);
                    _this.props.shouldCollapseNeighborNodes && _this.collapseNeighborNodes(targetNodeDatum, data);
                }
                else {
                    Tree.collapseNode(targetNodeDatum);
                }
                if (_this.props.enableLegacyTransitions) {
                    // Lock node toggling while transition takes place.
                    _this.setState({ data: data, isTransitioning: true });
                    // Await transitionDuration + 10 ms before unlocking node toggling again.
                    setTimeout(function () { return _this.setState({ isTransitioning: false }); }, _this.props.transitionDuration + 10);
                }
                else {
                    _this.setState({ data: data });
                }
                _this.internalState.targetNode = targetNodeDatum;
            }
        };
        _this.handleAddChildrenToNode = function (nodeId, childrenData) {
            var _a;
            var data = clone_1.default(_this.state.data);
            var matches = _this.findNodesById(nodeId, data, []);
            if (matches.length > 0) {
                var targetNodeDatum = matches[0];
                var depth_1 = targetNodeDatum.__rd3t.depth;
                var formattedChildren = clone_1.default(childrenData).map(function (node) {
                    return Tree.assignInternalProperties([node], depth_1 + 1);
                });
                (_a = targetNodeDatum.children).push.apply(_a, formattedChildren.flat());
                _this.setState({ data: data });
            }
        };
        /**
         * Handles the user-defined `onNodeClick` function.
         */
        _this.handleOnNodeClickCb = function (hierarchyPointNode, evt) {
            var onNodeClick = _this.props.onNodeClick;
            if (onNodeClick && typeof onNodeClick === 'function') {
                // Persist the SyntheticEvent for downstream handling by users.
                evt.persist();
                onNodeClick(clone_1.default(hierarchyPointNode), evt);
            }
        };
        /**
         * Handles the user-defined `onLinkClick` function.
         */
        _this.handleOnLinkClickCb = function (linkSource, linkTarget, evt) {
            var onLinkClick = _this.props.onLinkClick;
            if (onLinkClick && typeof onLinkClick === 'function') {
                // Persist the SyntheticEvent for downstream handling by users.
                evt.persist();
                onLinkClick(clone_1.default(linkSource), clone_1.default(linkTarget), evt);
            }
        };
        /**
         * Handles the user-defined `onNodeMouseOver` function.
         */
        _this.handleOnNodeMouseOverCb = function (hierarchyPointNode, evt) {
            var onNodeMouseOver = _this.props.onNodeMouseOver;
            if (onNodeMouseOver && typeof onNodeMouseOver === 'function') {
                // Persist the SyntheticEvent for downstream handling by users.
                evt.persist();
                onNodeMouseOver(clone_1.default(hierarchyPointNode), evt);
            }
        };
        /**
         * Handles the user-defined `onLinkMouseOver` function.
         */
        _this.handleOnLinkMouseOverCb = function (linkSource, linkTarget, evt) {
            var onLinkMouseOver = _this.props.onLinkMouseOver;
            if (onLinkMouseOver && typeof onLinkMouseOver === 'function') {
                // Persist the SyntheticEvent for downstream handling by users.
                evt.persist();
                onLinkMouseOver(clone_1.default(linkSource), clone_1.default(linkTarget), evt);
            }
        };
        /**
         * Handles the user-defined `onNodeMouseOut` function.
         */
        _this.handleOnNodeMouseOutCb = function (hierarchyPointNode, evt) {
            var onNodeMouseOut = _this.props.onNodeMouseOut;
            if (onNodeMouseOut && typeof onNodeMouseOut === 'function') {
                // Persist the SyntheticEvent for downstream handling by users.
                evt.persist();
                onNodeMouseOut(clone_1.default(hierarchyPointNode), evt);
            }
        };
        /**
         * Handles the user-defined `onLinkMouseOut` function.
         */
        _this.handleOnLinkMouseOutCb = function (linkSource, linkTarget, evt) {
            var onLinkMouseOut = _this.props.onLinkMouseOut;
            if (onLinkMouseOut && typeof onLinkMouseOut === 'function') {
                // Persist the SyntheticEvent for downstream handling by users.
                evt.persist();
                onLinkMouseOut(clone_1.default(linkSource), clone_1.default(linkTarget), evt);
            }
        };
        /**
         * Takes a hierarchy point node and centers the node on the screen
         * if the dimensions parameter is passed to `Tree`.
         *
         * This code is adapted from Rob Schmuecker's centerNode method.
         * Link: http://bl.ocks.org/robschmuecker/7880033
         */
        _this.centerNode = function (hierarchyPointNode) {
            var _a = _this.props, dimensions = _a.dimensions, orientation = _a.orientation, zoom = _a.zoom, centeringTransitionDuration = _a.centeringTransitionDuration;
            if (dimensions) {
                var g = d3_selection_1.select("." + _this.gInstanceRef);
                var svg = d3_selection_1.select("." + _this.svgInstanceRef);
                var scale = _this.state.d3.scale;
                var x = void 0;
                var y = void 0;
                // if the orientation is horizontal, calculate the variables inverted (x->y, y->x)
                if (orientation === 'horizontal') {
                    y = -hierarchyPointNode.x * scale + dimensions.height / 2;
                    x = -hierarchyPointNode.y * scale + dimensions.width / 2;
                }
                else {
                    // else, calculate the variables normally (x->x, y->y)
                    x = -hierarchyPointNode.x * scale + dimensions.width / 2;
                    y = -hierarchyPointNode.y * scale + dimensions.height / 2;
                }
                //@ts-ignore
                g.transition()
                    .duration(centeringTransitionDuration)
                    .attr('transform', 'translate(' + x + ',' + y + ')scale(' + scale + ')');
                // Sets the viewport to the new center so that it does not jump back to original
                // coordinates when dragged/zoomed
                //@ts-ignore
                svg.call(d3_zoom_1.zoom().transform, d3_zoom_1.zoomIdentity.translate(x, y).scale(zoom));
            }
        };
        /**
         * Determines which additional `className` prop should be passed to the node & returns it.
         */
        _this.getNodeClassName = function (parent, nodeDatum) {
            var _a = _this.props, rootNodeClassName = _a.rootNodeClassName, branchNodeClassName = _a.branchNodeClassName, leafNodeClassName = _a.leafNodeClassName;
            var hasParent = parent !== null && parent !== undefined;
            if (hasParent) {
                return nodeDatum.children ? branchNodeClassName : leafNodeClassName;
            }
            else {
                return rootNodeClassName;
            }
        };
        return _this;
    }
    Tree.getDerivedStateFromProps = function (nextProps, prevState) {
        var derivedState = null;
        // Clone new data & assign internal properties if `data` object reference changed.
        // If the dataKey was present but didn't change, then we don't need to re-render the tree
        var dataKeyChanged = !nextProps.dataKey || prevState.dataKey !== nextProps.dataKey;
        if (nextProps.data !== prevState.dataRef && dataKeyChanged) {
            derivedState = {
                dataRef: nextProps.data,
                data: Tree.assignInternalProperties(clone_1.default(nextProps.data)),
                isInitialRenderForDataset: true,
                dataKey: nextProps.dataKey,
            };
        }
        var d3 = Tree.calculateD3Geometry(nextProps);
        if (!lite_1.dequal(d3, prevState.d3)) {
            derivedState = derivedState || {};
            derivedState.d3 = d3;
        }
        return derivedState;
    };
    Tree.prototype.componentDidMount = function () {
        this.bindZoomListener(this.props);
        this.setState({ isInitialRenderForDataset: false });
    };
    Tree.prototype.componentDidUpdate = function (prevProps) {
        if (this.props.data !== prevProps.data) {
            // If last `render` was due to change in dataset -> mark the initial render as done.
            this.setState({ isInitialRenderForDataset: false });
        }
        if (!lite_1.dequal(this.props.translate, prevProps.translate) ||
            !lite_1.dequal(this.props.scaleExtent, prevProps.scaleExtent) ||
            this.props.zoomable !== prevProps.zoomable ||
            this.props.zoom !== prevProps.zoom ||
            this.props.enableLegacyTransitions !== prevProps.enableLegacyTransitions) {
            // If zoom-specific props change -> rebind listener with new values.
            // Or: rebind zoom listeners to new DOM nodes in case legacy transitions were enabled/disabled.
            this.bindZoomListener(this.props);
        }
        if (typeof this.props.onUpdate === 'function') {
            this.props.onUpdate({
                node: this.internalState.targetNode ? clone_1.default(this.internalState.targetNode) : null,
                zoom: this.state.d3.scale,
                translate: this.state.d3.translate,
            });
        }
        // Reset the last target node after we've flushed it to `onUpdate`.
        this.internalState.targetNode = null;
    };
    /**
     * Collapses all tree nodes with a `depth` larger than `initialDepth`.
     *
     * @param {array} nodeSet Array of nodes generated by `generateTree`
     * @param {number} initialDepth Maximum initial depth the tree should render
     */
    Tree.prototype.setInitialTreeDepth = function (nodeSet, initialDepth) {
        nodeSet.forEach(function (n) {
            n.data.__rd3t.collapsed = n.depth >= initialDepth;
        });
    };
    /**
     * bindZoomListener - If `props.zoomable`, binds a listener for
     * "zoom" events to the SVG and sets scaleExtent to min/max
     * specified in `props.scaleExtent`.
     */
    Tree.prototype.bindZoomListener = function (props) {
        var _this = this;
        var zoomable = props.zoomable, scaleExtent = props.scaleExtent, translate = props.translate, zoom = props.zoom, onUpdate = props.onUpdate, hasInteractiveNodes = props.hasInteractiveNodes;
        var svg = d3_selection_1.select("." + this.svgInstanceRef);
        var g = d3_selection_1.select("." + this.gInstanceRef);
        // Sets initial offset, so that first pan and zoom does not jump back to default [0,0] coords.
        // @ts-ignore
        svg.call(d3_zoom_1.zoom().transform, d3_zoom_1.zoomIdentity.translate(translate.x, translate.y).scale(zoom));
        svg.call(d3_zoom_1.zoom()
            .scaleExtent(zoomable ? [scaleExtent.min, scaleExtent.max] : [zoom, zoom])
            // TODO: break this out into a separate zoom handler fn, rather than inlining it.
            .filter(function () {
            if (hasInteractiveNodes)
                return (d3_selection_1.event.target.classList.contains(_this.svgInstanceRef) ||
                    d3_selection_1.event.target.classList.contains(_this.gInstanceRef) ||
                    d3_selection_1.event.shiftKey);
            return true;
        })
            .on('zoom', function () {
            g.attr('transform', d3_selection_1.event.transform);
            if (typeof onUpdate === 'function') {
                // This callback is magically called not only on "zoom", but on "drag", as well,
                // even though event.type == "zoom".
                // Taking advantage of this and not writing a "drag" handler.
                onUpdate({
                    node: null,
                    zoom: d3_selection_1.event.transform.k,
                    translate: { x: d3_selection_1.event.transform.x, y: d3_selection_1.event.transform.y },
                });
                // TODO: remove this? Shouldn't be mutating state keys directly.
                _this.state.d3.scale = d3_selection_1.event.transform.k;
                _this.state.d3.translate = {
                    x: d3_selection_1.event.transform.x,
                    y: d3_selection_1.event.transform.y,
                };
            }
        }));
    };
    /**
     * Assigns internal properties that are required for tree
     * manipulation to each node in the `data` set and returns a new `data` array.
     *
     * @static
     */
    Tree.assignInternalProperties = function (data, currentDepth) {
        if (currentDepth === void 0) { currentDepth = 0; }
        // Wrap the root node into an array for recursive transformations if it wasn't in one already.
        var d = Array.isArray(data) ? data : [data];
        return d.map(function (n) {
            var nodeDatum = n;
            nodeDatum.__rd3t = { id: null, depth: null, collapsed: false };
            nodeDatum.__rd3t.id = uuid_1.v4();
            // D3@v5 compat: manually assign `depth` to node.data so we don't have
            // to hold full node+link sets in state.
            // TODO: avoid this extra step by checking D3's node.depth directly.
            nodeDatum.__rd3t.depth = currentDepth;
            // If there are children, recursively assign properties to them too.
            if (nodeDatum.children && nodeDatum.children.length > 0) {
                nodeDatum.children = Tree.assignInternalProperties(nodeDatum.children, currentDepth + 1);
            }
            return nodeDatum;
        });
    };
    /**
     * Recursively walks the nested `nodeSet` until a node matching `nodeId` is found.
     */
    Tree.prototype.findNodesById = function (nodeId, nodeSet, hits) {
        var _this = this;
        if (hits.length > 0) {
            return hits;
        }
        hits = hits.concat(nodeSet.filter(function (node) { return node.__rd3t.id === nodeId; }));
        nodeSet.forEach(function (node) {
            if (node.children && node.children.length > 0) {
                hits = _this.findNodesById(nodeId, node.children, hits);
            }
        });
        return hits;
    };
    /**
     * Recursively walks the nested `nodeSet` until all nodes at `depth` have been found.
     *
     * @param {number} depth Target depth for which nodes should be returned
     * @param {array} nodeSet Array of nested `node` objects
     * @param {array} accumulator Accumulator for matches, passed between recursive calls
     */
    Tree.prototype.findNodesAtDepth = function (depth, nodeSet, accumulator) {
        var _this = this;
        accumulator = accumulator.concat(nodeSet.filter(function (node) { return node.__rd3t.depth === depth; }));
        nodeSet.forEach(function (node) {
            if (node.children && node.children.length > 0) {
                accumulator = _this.findNodesAtDepth(depth, node.children, accumulator);
            }
        });
        return accumulator;
    };
    /**
     * Recursively sets the internal `collapsed` property of
     * the passed `TreeNodeDatum` and its children to `true`.
     *
     * @static
     */
    Tree.collapseNode = function (nodeDatum) {
        nodeDatum.__rd3t.collapsed = true;
        if (nodeDatum.children && nodeDatum.children.length > 0) {
            nodeDatum.children.forEach(function (child) {
                Tree.collapseNode(child);
            });
        }
    };
    /**
     * Sets the internal `collapsed` property of
     * the passed `TreeNodeDatum` object to `false`.
     *
     * @static
     */
    Tree.expandNode = function (nodeDatum) {
        nodeDatum.__rd3t.collapsed = false;
    };
    /**
     * Collapses all nodes in `nodeSet` that are neighbors (same depth) of `targetNode`.
     */
    Tree.prototype.collapseNeighborNodes = function (targetNode, nodeSet) {
        var neighbors = this.findNodesAtDepth(targetNode.__rd3t.depth, nodeSet, []).filter(function (node) { return node.__rd3t.id !== targetNode.__rd3t.id; });
        neighbors.forEach(function (neighbor) { return Tree.collapseNode(neighbor); });
    };
    /**
     * Generates tree elements (`nodes` and `links`) by
     * grabbing the rootNode from `this.state.data[0]`.
     * Restricts tree depth to `props.initialDepth` if defined and if this is
     * the initial render of the tree.
     */
    Tree.prototype.generateTree = function () {
        var _a = this.props, initialDepth = _a.initialDepth, depthFactor = _a.depthFactor, separation = _a.separation, nodeSize = _a.nodeSize, orientation = _a.orientation;
        var isInitialRenderForDataset = this.state.isInitialRenderForDataset;
        var tree = d3_hierarchy_1.tree()
            .nodeSize(orientation === 'horizontal' ? [nodeSize.y, nodeSize.x] : [nodeSize.x, nodeSize.y])
            .separation(function (a, b) {
            return a.parent.data.__rd3t.id === b.parent.data.__rd3t.id
                ? separation.siblings
                : separation.nonSiblings;
        });
        var rootNode = tree(d3_hierarchy_1.hierarchy(this.state.data[0], function (d) { return (d.__rd3t.collapsed ? null : d.children); }));
        var nodes = rootNode.descendants();
        var links = rootNode.links();
        // Configure nodes' `collapsed` property on first render if `initialDepth` is defined.
        if (initialDepth !== undefined && isInitialRenderForDataset) {
            this.setInitialTreeDepth(nodes, initialDepth);
        }
        if (depthFactor) {
            nodes.forEach(function (node) {
                node.y = node.depth * depthFactor;
            });
        }
        return { nodes: nodes, links: links };
    };
    /**
     * Set initial zoom and position.
     * Also limit zoom level according to `scaleExtent` on initial display. This is necessary,
     * because the first time we are setting it as an SVG property, instead of going
     * through D3's scaling mechanism, which would have picked up both properties.
     *
     * @static
     */
    Tree.calculateD3Geometry = function (nextProps) {
        var scale;
        if (nextProps.zoom > nextProps.scaleExtent.max) {
            scale = nextProps.scaleExtent.max;
        }
        else if (nextProps.zoom < nextProps.scaleExtent.min) {
            scale = nextProps.scaleExtent.min;
        }
        else {
            scale = nextProps.zoom;
        }
        return {
            translate: nextProps.translate,
            scale: scale,
        };
    };
    Tree.prototype.render = function () {
        var _this = this;
        var _a = this.generateTree(), nodes = _a.nodes, links = _a.links;
        var _b = this.props, renderCustomNodeElement = _b.renderCustomNodeElement, orientation = _b.orientation, pathFunc = _b.pathFunc, transitionDuration = _b.transitionDuration, nodeSize = _b.nodeSize, depthFactor = _b.depthFactor, initialDepth = _b.initialDepth, separation = _b.separation, enableLegacyTransitions = _b.enableLegacyTransitions, svgClassName = _b.svgClassName, pathClassFunc = _b.pathClassFunc;
        var _c = this.state.d3, translate = _c.translate, scale = _c.scale;
        var subscriptions = __assign(__assign(__assign({}, nodeSize), separation), { depthFactor: depthFactor,
            initialDepth: initialDepth });
        return (react_1.default.createElement("div", { className: "rd3t-tree-container rd3t-grabbable" },
            react_1.default.createElement("style", null, globalCss_1.default),
            react_1.default.createElement("svg", { className: "rd3t-svg " + this.svgInstanceRef + " " + svgClassName, width: "100%", height: "100%" },
                react_1.default.createElement(TransitionGroupWrapper_1.default, { enableLegacyTransitions: enableLegacyTransitions, component: "g", className: "rd3t-g " + this.gInstanceRef, transform: "translate(" + translate.x + "," + translate.y + ") scale(" + scale + ")" },
                    links.map(function (linkData, i) {
                        return (react_1.default.createElement(Link_1.default, { key: 'link-' + i, orientation: orientation, pathFunc: pathFunc, pathClassFunc: pathClassFunc, linkData: linkData, onClick: _this.handleOnLinkClickCb, onMouseOver: _this.handleOnLinkMouseOverCb, onMouseOut: _this.handleOnLinkMouseOutCb, enableLegacyTransitions: enableLegacyTransitions, transitionDuration: transitionDuration }));
                    }),
                    nodes.map(function (hierarchyPointNode, i) {
                        var data = hierarchyPointNode.data, x = hierarchyPointNode.x, y = hierarchyPointNode.y, parent = hierarchyPointNode.parent;
                        return (react_1.default.createElement(Node_1.default, { key: 'node-' + i, data: data, position: { x: x, y: y }, hierarchyPointNode: hierarchyPointNode, parent: parent, nodeClassName: _this.getNodeClassName(parent, data), renderCustomNodeElement: renderCustomNodeElement, nodeSize: nodeSize, orientation: orientation, enableLegacyTransitions: enableLegacyTransitions, transitionDuration: transitionDuration, onNodeToggle: _this.handleNodeToggle, onNodeClick: _this.handleOnNodeClickCb, onNodeMouseOver: _this.handleOnNodeMouseOverCb, onNodeMouseOut: _this.handleOnNodeMouseOutCb, handleAddChildrenToNode: _this.handleAddChildrenToNode, subscriptions: subscriptions, centerNode: _this.centerNode }));
                    })))));
    };
    Tree.defaultProps = {
        onNodeClick: undefined,
        onNodeMouseOver: undefined,
        onNodeMouseOut: undefined,
        onLinkClick: undefined,
        onLinkMouseOver: undefined,
        onLinkMouseOut: undefined,
        onUpdate: undefined,
        orientation: 'horizontal',
        translate: { x: 0, y: 0 },
        pathFunc: 'diagonal',
        pathClassFunc: undefined,
        transitionDuration: 500,
        depthFactor: undefined,
        collapsible: true,
        initialDepth: undefined,
        zoomable: true,
        zoom: 1,
        scaleExtent: { min: 0.1, max: 1 },
        nodeSize: { x: 140, y: 140 },
        separation: { siblings: 1, nonSiblings: 2 },
        shouldCollapseNeighborNodes: false,
        svgClassName: '',
        rootNodeClassName: '',
        branchNodeClassName: '',
        leafNodeClassName: '',
        renderCustomNodeElement: undefined,
        enableLegacyTransitions: false,
        hasInteractiveNodes: false,
        dimensions: undefined,
        centeringTransitionDuration: 800,
        dataKey: undefined,
    };
    return Tree;
}(react_1.default.Component));
exports.default = Tree;
