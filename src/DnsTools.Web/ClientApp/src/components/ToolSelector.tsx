import React from 'react';

import Config from '../config.json';
import {ToolMetadata} from './MainForm';
import RadioList from './form/RadioList';

type Props = Readonly<{
  selectedTool: ToolMetadata;
  toolOptions: ReadonlyArray<ToolMetadata>;
  onSelectTool: (tool: ToolMetadata) => void;
}>;
export default function ToolSelector(props: Props) {
  return (
    <>
      <LargeToolSelector {...props} />
      <SmallToolSelector {...props} />
    </>
  );
}

/**
 * Big selector for large screens
 */
function LargeToolSelector(props: Props) {
  return (
    <div className="d-none d-lg-block">
      <div className="card-deck" style={{marginBottom: '-1rem'}}>
        {props.toolOptions.map((tool, index) => {
          const isSelected = props.selectedTool.tool === tool.tool;
          const id = `selector-${tool.tool}`;
          return (
            <React.Fragment key={tool.tool}>
              <div
                className={`card tool-card mb-4 ${
                  isSelected ? 'bg-primary active' : ''
                }`}
                onClick={() => props.onSelectTool(tool)}>
                <div className={`card-body`} role="button">
                  <h5 className="card-title">
                    <input
                      checked={isSelected}
                      id={id}
                      type="radio"
                      onChange={() => props.onSelectTool(tool)}
                    />{' '}
                    <label htmlFor={id}>{tool.label}</label>
                  </h5>
                  <p className="card-text">
                    {tool.description.replace(
                      '{workerCount}',
                      '' + Config.workers.length,
                    )}
                  </p>
                </div>
              </div>

              {/* Render 3 cards per row */}
              {(index + 1) % 3 === 0 && <div className="w-100" />}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Small radio button selector for small screens
 */
function SmallToolSelector(props: Props) {
  const description = props.selectedTool.description.replace(
    '{workerCount}',
    '' + Config.workers.length,
  );
  return (
    <div className="d-lg-none">
      <RadioList
        name="tool"
        options={props.toolOptions.map(tool => ({
          id: tool.tool,
          label: tool.label,
          value: tool,
        }))}
        selectedValue={props.selectedTool}
        onSelect={props.onSelectTool}
      />
      <br />
      <small>{description}</small>
    </div>
  );
}
