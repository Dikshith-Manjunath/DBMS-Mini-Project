import React from "react";
import Feature1 from "./Features/Feature1";
import Feature2 from "./Features/Feature2";
import Feature3 from "./Features/Feature3";

export default function Feature() {
  return (
    <>
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <Feature1/>
            <Feature2/>
            <Feature3/>
          </div>
        </div>
      </section>
    </>
  );
}
