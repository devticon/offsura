import {
  GraphQLResponse,
  Network,
  UploadableMap,
} from "relay-runtime/lib/network/RelayNetworkTypes";
import { CacheConfig, RequestParameters, Variables } from "relay-runtime";
import { RelayObservable } from "relay-runtime/lib/network/RelayObservable";
import { offsura } from "../index";

export class OffsuraNetwork implements Network {
  execute(
    request: RequestParameters,
    variables: Variables,
    cacheConfig: CacheConfig,
    uploadables: UploadableMap | null | undefined
  ): RelayObservable<GraphQLResponse> {
    return RelayObservable.from(
      offsura(request.text, variables) as Promise<GraphQLResponse>
    );
  }
}
