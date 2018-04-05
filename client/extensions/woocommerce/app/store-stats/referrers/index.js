/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { find } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import QuerySiteStats from 'components/data/query-site-stats';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import { getUnitPeriod } from 'woocommerce/app/store-stats/utils';
import StoreStatsPeriodNav from 'woocommerce/app/store-stats/store-stats-period-nav';
import JetpackColophon from 'components/jetpack-colophon';
import Main from 'components/main';
import Module from 'woocommerce/app/store-stats/store-stats-module';
import SearchCard from 'components/search-card';
import StoreStatsReferrerWidget from 'woocommerce/app/store-stats/store-stats-referrer-widget';
import { sortBySales } from 'woocommerce/app/store-stats/referrers/helpers';
import { getStoreReferrersByDate, getStoreReferrersByReferrer } from 'state/selectors';
import Chart from './chart';

const STAT_TYPE = 'statsStoreReferrers';
const LIMIT = 10;

class Referrers extends Component {
	static propTypes = {
		siteId: PropTypes.number,
		query: PropTypes.object.isRequired,
		data: PropTypes.array.isRequired,
		selectedDate: PropTypes.string,
		unit: PropTypes.oneOf( [ 'day', 'week', 'month', 'year' ] ),
		slug: PropTypes.string,
		limit: PropTypes.number,
	};

	state = {
		filter: '',
	};

	componentWillReceiveProps( nextProps ) {
		this.setData( nextProps, this.state.filter );
	}

	componentWillMount() {
		this.setData( this.props, this.state.filter );
	}

	onSearch = str => {
		this.setData( this.props, str );
	};

	getFilteredData = ( filter, { data } ) => {
		const filteredData = filter ? data.filter( d => d.referrer.match( filter ) ) : data;
		return {
			filteredSortedData: sortBySales( filteredData ),
			unfilteredDataLength: data.length,
		};
	};

	getSelectedReferrer = ( filteredSortedData, { queryParams } ) => {
		let selectedReferrerIndex = null;
		const selectedReferrer = find( filteredSortedData, ( d, idx ) => {
			if ( queryParams.referrer && queryParams.referrer === d.referrer ) {
				selectedReferrerIndex = idx;
				return true;
			}
			return false;
		} );
		return {
			selectedReferrer,
			selectedReferrerIndex,
		};
	};

	setData( props, filter ) {
		const { filteredSortedData, unfilteredDataLength } = this.getFilteredData( filter, props );
		const { selectedReferrer, selectedReferrerIndex } = this.getSelectedReferrer(
			filteredSortedData,
			props
		);
		this.setState( {
			filter,
			filteredSortedData,
			unfilteredDataLength,
			selectedReferrer,
			selectedReferrerIndex,
		} );
	}

	render() {
		const {
			siteId,
			query,
			selectedDate,
			unit,
			slug,
			translate,
			queryParams,
			periodData,
		} = this.props;
		const {
			filter,
			filteredSortedData,
			unfilteredDataLength,
			selectedReferrer,
			selectedReferrerIndex,
		} = this.state;
		const unitSelectedDate = getUnitPeriod( selectedDate, unit );
		const showSearch = unfilteredDataLength > LIMIT;
		const title = `${ translate( 'Store Referrers' ) }${
			queryParams.referrer ? ' - ' + queryParams.referrer : ''
		}`;
		return (
			<Main className="referrers woocommerce" wideLayout>
				{ siteId && <QuerySiteStats statType={ STAT_TYPE } siteId={ siteId } query={ query } /> }
				<StoreStatsPeriodNav
					type="referrers"
					selectedDate={ selectedDate }
					unit={ unit }
					slug={ slug }
					query={ query }
					statType={ STAT_TYPE }
					title={ title }
					queryParams={ queryParams }
				/>
				<Module
					className="referrers__chart"
					siteId={ siteId }
					emptyMessage={ translate( 'No data found' ) }
					query={ query }
					statType={ STAT_TYPE }
				>
					<Chart
						data={ periodData }
						unitSelectedDate={ unitSelectedDate }
						selectedReferrer={ selectedReferrer && selectedReferrer.referrer }
					/>
				</Module>
				<Module
					className="referrers__search"
					siteId={ siteId }
					emptyMessage={ translate( 'No data found' ) }
					query={ query }
					statType={ STAT_TYPE }
				>
					{ showSearch && (
						<SearchCard
							className={ 'referrers__search-filter' }
							onSearch={ this.onSearch }
							placeholder="Filter Referrers"
							value={ filter }
							initialValue={ filter }
						/>
					) }
					<StoreStatsReferrerWidget
						fetchedData={ filteredSortedData }
						unit={ unit }
						siteId={ siteId }
						query={ query }
						statType={ STAT_TYPE }
						unitSelectedDate={ unitSelectedDate }
						queryParams={ queryParams }
						slug={ slug }
						limit={ LIMIT }
						pageType="referrers"
						paginate
						selectedIndex={ selectedReferrerIndex }
						selectedReferrer={ selectedReferrer && selectedReferrer.referrer }
					/>
				</Module>
				<JetpackColophon />
			</Main>
		);
	}
}

export default connect( ( state, { query, selectedDate, unit, queryParams } ) => {
	const siteId = getSelectedSiteId( state );
	return {
		slug: getSelectedSiteSlug( state ),
		siteId,
		data: getStoreReferrersByDate( state, {
			query,
			siteId,
			statType: STAT_TYPE,
			unitSelectedDate: getUnitPeriod( selectedDate, unit ),
		} ),
		periodData: getStoreReferrersByReferrer( state, {
			siteId,
			statType: STAT_TYPE,
			query,
			queryParams,
		} ),
	};
} )( localize( Referrers ) );
