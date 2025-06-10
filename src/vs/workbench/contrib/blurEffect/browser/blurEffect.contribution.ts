/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { registerWorkbenchContribution2, WorkbenchPhase } from '../../../common/contributions.js';
import { BlurEffectContribution } from './blurEffectContribution.js';

registerWorkbenchContribution2(BlurEffectContribution.ID, BlurEffectContribution, WorkbenchPhase.AfterRestored);
