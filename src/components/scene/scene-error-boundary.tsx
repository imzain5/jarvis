"use client";

import { Component, ReactNode } from "react";

import SceneBackdrop from "@/components/scene/scene-backdrop";

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
};

export class SceneErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
  };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("Enhanced scene failed to render.", error);
  }

  render() {
    if (this.state.hasError) {
      return <SceneBackdrop />;
    }

    return this.props.children;
  }
}
