import { defineGkElement, Menu, MenuItem, Popover } from '@gitkraken/shared-web-components';
import { html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { when } from 'lit/directives/when.js';
import type { Change, State } from '../../../../../plus/webviews/patchDetails/protocol';
import type { Serialized } from '../../../../../system/serialize';
import '../../../shared/components/button';
import '../../../shared/components/code-icon';
import './gl-create-details';

export interface CreatePatchEventDetail {
	title: string;
	description?: string;
	changes: Change[];
}

@customElement('gl-patch-create')
export class GlPatchCreate extends LitElement {
	@property({ type: Object }) state?: Serialized<State>;

	@state()
	patchTitle = '';

	@state()
	description = '';

	@state()
	selectedChanges: Change[] = [];

	get hasWipChanges() {
		if (this.state?.create == null) {
			return false;
		}

		return this.state.create.some(c => c.type === 'wip');
	}

	@state()
	get canSubmit() {
		return this.patchTitle.length > 0; // this.selectedChanges.length > 0 &&
	}

	constructor() {
		super();

		defineGkElement(Menu, MenuItem, Popover);
	}

	renderForm() {
		return html`
			<div class="section">
				<div class="message-input">
					<input type="text" class="message-input__control" placeholder="Title" .value=${this.patchTitle} @input=${
						this.onTitleInput
					}></textarea>
				</div>
				<div class="message-input">
					<textarea class="message-input__control" placeholder="Description (optional)" .value=${this.description}  @input=${
						this.onDescriptionInput
					}></textarea>
				</div>
				<p class="button-container">
					<span class="button-group button-group--single">
						<gl-button ?disabled=${!this.canSubmit} full @click=${this.onCreateAll}>Create Patch</gl-button>
						${when(
							this.hasWipChanges,
							() => html`
								<gk-popover placement="bottom">
									<gl-button
										slot="trigger"
										?disabled=${!this.canSubmit}
										density="compact"
										aria-label="Create Patch Options..."
										title="Create Patch Options..."
										><code-icon icon="chevron-down"></code-icon
									></gl-button>
									<gk-menu class="mine-menu" @select=${this.onSelectCreateOption}>
										<gk-menu-item data-value="staged">Create Patch from Staged Files</gk-menu-item>
										<gk-menu-item data-value="unstaged"
											>Create Patch from Unstaged Files</gk-menu-item
										>
									</gk-menu>
								</gk-popover>
							`,
						)}
					</span>
				</p>
			</div>
			`;
	}

	override render() {
		return html`
			${this.renderForm()}
			<gl-create-details
				.files=${this.state?.create?.[0].files}
				.preferences=${this.state?.preferences}
				.isUncommitted=${true}
				noheader
			>
			</gl-create-details>
		`;
	}

	private createPatch(changes: Change[]) {
		if (!this.canSubmit) {
			// TODO: show error
			return;
		}

		const patch = {
			title: this.patchTitle,
			description: this.description,
			changes: changes,
		};

		this.dispatchEvent(new CustomEvent<CreatePatchEventDetail>('create-patch', { detail: patch }));
	}

	private onCreateAll(_e: Event) {
		const change = this.state?.create?.[0];
		if (change == null) {
			return;
		}
		this.createPatch([change]);
	}

	private onSelectCreateOption(e: CustomEvent<{ target: MenuItem }>) {
		const target = e.detail?.target;
		const value = target?.dataset?.value as 'staged' | 'unstaged' | undefined;
		const currentChange = this.state?.create?.[0];
		if (value == null || currentChange == null) {
			return;
		}
		const change = {
			...currentChange,
			files: currentChange.files.filter(file => {
				const staged = file.staged ?? false;
				return (staged && value === 'staged') || (!staged && value === 'unstaged');
			}),
		};

		this.createPatch([change]);
	}

	private onTitleInput(e: InputEvent) {
		this.patchTitle = (e.target as HTMLInputElement).value;
	}

	private onDescriptionInput(e: InputEvent) {
		this.description = (e.target as HTMLInputElement).value;
	}

	protected override createRenderRoot() {
		return this;
	}
}