/* @flow */

import * as React from 'react'
import { matchPath, type RouterHistory, type Location, type Match } from 'react-router'
import type { Route, RouteProps } from './TypeDefinitions'

type Props = Route &
  RouteProps & {
    history: RouterHistory,
  }

type State = {|
  location: Location,
  match: ?Match,
|}

class SceneView extends React.Component<Props, State> {
  unlisten: ?Function

  constructor(props: Props) {
    super(props)
    const { history: { location }, routeMatch } = props
    this.state = { match: routeMatch, location }
  }

  componentWillMount() {
    const { history } = this.props
    this.unlisten = history.listen(this.onHistoryChange)
  }

  componentWillUnmount() {
    if (this.unlisten) this.unlisten()
  }

  onHistoryChange = (location: Location) => {
    const { path, exact, strict } = this.props
    const match = matchPath(location.pathname, { path, exact, strict })
    if (!this.state.match) {
      this.setState({ match, location })
    } else {
      this.setState({ location })
    }
  }

  shouldComponentUpdate(nextProps: Props, nextState: State) {
    return !!nextState.match
  }

  render() {
    const { render, children, component: Component, history } = this.props
    const { match, location } = this.state
    const contextRouter = { history, match, location }
    if (render) {
      return render(contextRouter)
    } else if (children && typeof children === 'function') {
      return children(contextRouter)
    } else if (children && React.Children.count(children) === 0) {
      return React.cloneElement(children, contextRouter)
    } else if (Component) {
      return <Component {...contextRouter} />
    }
    return null
  }
}

export default SceneView