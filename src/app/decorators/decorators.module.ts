import { ModuleWithProviders, NgModule } from '@angular/core';
import { NeedsAuthentication } from './needsAuthentication';

@NgModule({
    imports: [],
    exports: []
})
export class DecoratorsModule {
    public static forRoot(): ModuleWithProviders<DecoratorsModule> {
        return {
            ngModule: DecoratorsModule,
            providers: [
                NeedsAuthentication
            ]
        };
    }
}
