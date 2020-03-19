import React from 'react';
import * as yaxel from './yaxel'
import './TypedInput.css';

interface UnionInputState {
    selectedCaseName: string
    selectedCaseType: yaxel.Type | null
}

class UnionInput extends React.Component<{ union: yaxel.UnionType }, UnionInputState> {
    constructor(props: { union: yaxel.UnionType }) {
        super(props);
        this.state = {
            selectedCaseName: props.union.cases[0].name,
            selectedCaseType: props.union.cases[0].type
        }
    }
    private setSelectedIndex(i: number) {
        this.setState({
            selectedCaseName: this.props.union.cases[i].name,
            selectedCaseType: this.props.union.cases[i].type
        });
    }
    render() {
        return (<div>
            <select onChange={(e) => this.setSelectedIndex(e.target.selectedIndex)}>
                {this.props.union.cases.map(item =>
                    <option value={item.name}>{item.name}</option>)}
            </select>
            {this.state.selectedCaseType == null ?
                <span></span> :
                <TypedInput name='' type={this.state.selectedCaseType} />}
        </div>);
    }
}

interface BoolInputProps {
    onChange: (value: boolean) => void;
}

class BoolInput extends React.Component<BoolInputProps, { value: boolean }> {
    constructor(props: BoolInputProps) {
        super(props);
        this.state = { value: false };
    }
    private onChange(checked: boolean) {
        console.log("BoolInput#onChange: " + checked);
        this.setState({ value: checked });
        console.log("BoolInput#onChange: 1");
        this.props.onChange(checked);
        console.log("BoolInput#onChange: 2");
    }
    render() {
        return <input type='checkbox' checked={this.state.value} onChange={(e) => this.onChange(e.target.checked)}></input>
    }
}

class TypedInput extends React.Component<yaxel.TypedItem, { value: any }> {
    constructor(props: yaxel.TypedItem) {
        super(props);
        this.state = { value: null };
    }
    private caption() {
        return this.props.name.length === 0 ? "" : this.props.name + " = ";
    }
    private onChange(x: any) {
        console.log("TypedInput#onChange: " + x);
        this.setState({ value: x });
    }
    private renderInternal() {
        switch (this.props.type) {
            case "int":
            case "float":
            case "string":
                return <span>{this.caption()}<input onChange={(e) => this.onChange(e.target.value)}></input></span>;
            case "bool":
                return <span><input type='checkbox' onChange={(e) => this.onChange(e.target.checked)}></input><label>{this.props.name}</label></span>;
            //return <span><BoolInput onChange={(x) => this.onChange(x)}></BoolInput><label>{this.props.name}</label></span>;
            default:
                if (Array.isArray(this.props.type)) {
                    return JSON.stringify(this.props.type);
                }
                switch (this.props.type.tag) {
                    case 'record':
                        return (<div>
                            <div>{this.caption()}{this.props.type.name}</div>
                            {this.props.type.fields.map(item =>
                                <div><TypedInput name={item.name} type={item.type} /></div>
                            )}
                        </div>);
                    case 'union':
                        return <div>{this.caption()}<UnionInput union={this.props.type} /></div>;
                    default:
                        return JSON.stringify(this.props.type);
                }
        }
    }
    render() {
        return <div className="TypedInput">{this.renderInternal()}</div>;
    }
}

export default TypedInput;
